let fs = window.RequestFileSystem || window.webkitRequestFileSystem;

window.favicon = new Favico({
  animation:'pop',
  type : 'rectangle'
});

$(function() {
  let beep = new Audio('beep.mp3');
  let isActive = false;
  let newMessages = 0;
  let FADE_TIME = 150; // ms
  let TYPING_TIMER_LENGTH = 400; // ms
  let soundEnabled = true;

  let COLORS = [
    '#e21400', '#ffe400', '#ff8f00',
    '#58dc00', '#dd9cff', '#4ae8c4',
    '#3b88eb', '#f47777', '#d300e7',
  ];  

  let $window = $(window);
  let $messages = $('.messages'); // Messages area
  let $inputMessage = $('.inputMessage'); // Input message input box
  let $key = $('.key');
  let $genKey = $('.new_key');
  let $participants = $('#participants');

  let $chatPage = $('.chat.page'); // The chatroom page

  let users = [];

  // Prompt for setting a username
  let username;
  let myUserId;
  let connected = false;
  let typing = false;
  let lastTypingTime;

  let roomId = window.location.pathname.length ? window.location.pathname : null;

  let keys = {};

  if (!roomId) return;

  if (!window.crypto || (!window.crypto.subtle && !window.crypto.webkitSubtle)) {
    $('#no-crypto').modal({
      backdrop: 'static',
      show: false,
      keyboard: false
    })
    $('#no-crypto').modal('show');  
    return;
  }

  $('textarea.share-text').val("Let's chat on darkwire.io at https://darkwire.io" + roomId);  

  $('textarea.share-text').click(function() {
    $(this).focus();
    $(this).select();
    this.setSelectionRange(0, 9999);
  });

  var crypto = window.crypto;
  var cryptoSubtle = window.crypto.subtle || window.crypto.webkitSubtle;

  let socket = io(roomId);

  FastClick.attach(document.body);

  function addParticipantsMessage (data) {
    let message = '';
    let headerMsg = '';

    $participants.text(data.numUsers);
  }

  // Sets the client's username
  function initChat () {
    username = window.username;
    // warn not incognitor
    if (!fs) {
      console.log('no fs');
    } else {
      fs(window.TEMPORARY,
        100,
        log.bind(log, "WARNING: Your browser is not in incognito mode!"));
    }

    // If the username is valid
    if (username) {
      $chatPage.show();
      $inputMessage.focus();

      Promise.all([
        createPrimaryKeys(),
        createSigningKeys()
      ])
      .then(function(data) {
        keys.primary = {
          public: data[0].publicKey,
          private: data[0].privateKey
        };
        keys.signing = {
          public: data[1].publicKey,
          private: data[1].privateKey
        };
        return Promise.all([
          exportKey(data[0].publicKey),
          exportKey(data[1].publicKey),
        ]);
      })
      .then(function(exportedKeys) {
        // Tell the server your username and send public keys
        socket.emit('add user', {
          username: username,
          publicPrimaryKey: exportedKeys[0],
          publicSigningKey: exportedKeys[1]
        });
      });
    }
  }

  // Sends a chat message
  function sendMessage () {
    // Don't send unless other users exist
    if (users.length <= 1) return;

    let message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      $('#send-message-btn').removeClass('active');      
      addChatMessage({
        username: username,
        message: message
      });
      let vector = crypto.getRandomValues(new Uint8Array(16));

      let secretKey;
      let secretKeys;
      let messageData;
      let signature;

      // Generate new secret key and vector for each message
      createSecretKey()
      .then(function(key) {
        secretKey = key;
        // Generate secretKey and encrypt with each user's public key
        let promises = [];
        _.each(users, function(user) {
          // It not me
          if (user.username !== window.username) {
            let promise = new Promise(function(resolve, reject) {
              let thisUser = user;

              let exportedSecretKey;
              exportKey(key, "raw")
              .then(function(data) {
                exportedSecretKey = data;
                return encryptSecretKey(data, thisUser.publicPrimaryKey);
              })
              .then(function(encryptedSecretKey) {
                var encData = new Uint8Array(encryptedSecretKey);
                var str = convertArrayBufferViewToString(encData);
                resolve({
                  id: thisUser.id,
                  secretKey: str
                });
              });
            });
            promises.push(promise);
          }
        });
        return Promise.all(promises);
      })
      .then(function(data) {
        secretKeys = data;
        messageData = convertStringToArrayBufferView(message);
        return signKey(messageData, keys.signing.private)
      })
      .then(function(data) {
        signature = data;
        return encryptMessage(messageData, secretKey, vector)
      })
      .then(function(encryptedData) {
        let msg = convertArrayBufferViewToString(new Uint8Array(encryptedData));
        let vct = convertArrayBufferViewToString(new Uint8Array(vector));
        let sig = convertArrayBufferViewToString(new Uint8Array(signature));
        socket.emit('new message', {
          message: msg,
          vector: vct,
          secretKeys: secretKeys,
          signature: sig
        });
      });
    }
  }

  // Log a message
  function log (message, options) {
    let html = options && options.html === true || false;
    let $el;
    if (html) {
      $el = $('<li>').addClass('log').html(message);
    } else {
      $el = $('<li>').addClass('log').text(message);
    }
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    if (!data.message.trim().length) return;

    // Don't fade the message in if there is an 'X was typing'
    let $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    let $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    let $messageBodyDiv = $('<span class="messageBody">')
      .html(data.message);

    let typingClass = data.typing ? 'typing' : '';
    let $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    let $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }

    $messages[0].scrollTop = $messages[0].scrollHeight; // minus 60 for key
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    let message = $('<div/>').html(input).text();
    message = Autolinker.link(message);
    return message;
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        let typingTimer = (new Date()).getTime();
        let timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    let hash = 7;
    for (let i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    let index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // When the client hits ENTER on their keyboard and chat message input is focused
    if (event.which === 13 && $('.inputMessage').is(':focus')) {
      sendMessage();
      socket.emit('stop typing');
      typing = false;
    }

  });

  $inputMessage.on('input propertychange paste change', function() {
    updateTyping();
    let message = $(this).val().trim();
    if (message.length) {
      $('#send-message-btn').addClass('active');
    } else {
      $('#send-message-btn').removeClass('active');
    }
  });

  // Select message input when closing modal
  $('.modal').on('hidden.bs.modal', function (e) {
    $inputMessage.focus();      
  });

  // Select message input when clicking message body, unless selecting text
  $('.messages').on('click', function() {
    if (!getSelectedText()) {
      $inputMessage.focus();
    }
  });

  function getSelectedText() {
    var text = "";
    if (typeof window.getSelection != "undefined") {
      text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
      text = document.selection.createRange().text;
    }
    return text;
  }

  // Whenever the server emits 'login', log the login message
  socket.on('user joined', function (data) {
    connected = true;
    addParticipantsMessage(data);

    let importKeysPromises = [];
    
    // Import all user keys if not already there
    _.each(data.users, function(user) {
      if (!_.findWhere(users, {id: user.id})) {
        let promise = new Promise(function(resolve, reject) {
          let currentUser = user;
          Promise.all([
            importPrimaryKey(currentUser.publicPrimaryKey),
            importSigningKey(currentUser.publicSigningKey)
          ])
          .then(function(keys) {
            users.push({
              id: currentUser.id,
              username: currentUser.username,
              publicPrimaryKey: keys[0],
              publicSigningKey: keys[1]
            });
            resolve();
          });
        });
        importKeysPromises.push(promise);
      }
    });

    if (!myUserId) {
      // Set my id if not already set
      let me = _.findWhere(data.users, {username: username});
      myUserId = me.id;
    }

    Promise.all(importKeysPromises)
    .then(function() {
      // All users' keys have been imported
      if (data.numUsers === 1) {
        $('#first-modal').modal('show');
      }

      $('.modal').on('shown.bs.modal', function (e) {
        autosize.update($('textarea.share-text'));
      });

      log(data.username + ' joined');

      renderParticipantsList();
    });      

  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    // Don't show messages if no key
    if (!isActive) {
      newMessages++;
      favicon.badge(newMessages);
      if (soundEnabled && beep) {
        beep.play();
      }
    }

    let message = data.message;
    let messageData = convertStringToArrayBufferView(message);
    let username = data.username; 
    let senderId = data.id
    let vector = data.vector;
    let vectorData = convertStringToArrayBufferView(vector);
    let secretKeys = data.secretKeys;
    let decryptedMessageData;
    let decryptedMessage;

    let mySecretKey = _.find(secretKeys, function(key) {
      return key.id === myUserId;
    });
    let signature = data.signature;
    let signatureData = convertStringToArrayBufferView(signature);
    let secretKeyArrayBuffer = convertStringToArrayBufferView(mySecretKey.secretKey);

    decryptSecretKey(secretKeyArrayBuffer, keys.primary.private)
    .then(function(data) {
      return new Uint8Array(data);
    })
    .then(function(data) {
      return importSecretKey(data, "raw");
    })
    .then(function(data) {
      let secretKey = data;
      return decryptMessage(messageData, secretKey, vectorData);
    })
    .then(function(data) {
      decryptedMessageData = data;
      decryptedMessage = convertArrayBufferViewToString(new Uint8Array(data))
    })
    .then(function() {
      // Find who sent msg (senderId), get their public key and verifyKey() with it and signature
      let sender = _.find(users, function(user) {
        return user.id === senderId;
      });
      let senderPublicVerifyKey = sender.publicSigningKey;
      return verifyKey(signatureData, decryptedMessageData, senderPublicVerifyKey)
    })
    .then(function(bool) {
      if (bool) {
        addChatMessage({
          username: username,
          message: decryptedMessage
        });          
      }
    });
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);

    users = _.without(users, _.findWhere(users, {id: data.id}));

    renderParticipantsList();
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  initChat();

  window.onfocus = function () { 
    isActive = true;
    newMessages = 0;
    favicon.reset();
  }; 

  window.onblur = function () { 
    isActive = false;
  };

  // Nav links
  $('a#settings-nav').click(function() {
    $('#settings-modal').modal('show');
  });

  $('a#about-nav').click(function() {
    $('#about-modal').modal('show');
  });

  $('[data-toggle="tooltip"]').tooltip();

  $('.navbar .participants').click(function() {
    renderParticipantsList();
    $('#participants-modal').modal('show');
  });

  function renderParticipantsList() {
    $('#participants-modal ul.users').empty();
    _.each(users, function(user) {
      let li;
      if (user.username === window.username) {
        // User is me
        li = $("<li>" + user.username + " <span class='you'>(you)</span></li>").css('color', getUsernameColor(user.username));
      } else {
        li = $("<li>" + user.username + "</li>").css('color', getUsernameColor(user.username));
      }
      $('#participants-modal ul.users')
        .append(li);        
    });    
  }

  $('#send-message-btn').click(function() {
    sendMessage();
    socket.emit('stop typing');
    typing = false;
  });

  $('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
  });

  $('input.bs-switch').bootstrapSwitch();

  $('input.bs-switch').on('switchChange.bootstrapSwitch', function(event, state) {
    soundEnabled = state;
  });

  function convertStringToArrayBufferView(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }

    return bytes;
  }

  function convertArrayBufferViewToString(buffer) {
    var str = "";
    for (var i = 0; i < buffer.byteLength; i++) {
      str += String.fromCharCode(buffer[i]);
    }

    return str;
  }

  function createSigningKeys() {    
    return crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["sign", "verify"] //can be any combination of "sign" and "verify"
    );
  }

  function createPrimaryKeys() {
    return crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt", "decrypt"] //must be ["encrypt", "decrypt"] or ["wrapKey", "unwrapKey"]
    );
  }

  function createSecretKey() {
    return crypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256, //can be  128, 192, or 256
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"] //can be "encrypt", "decrypt", "wrapKey", or "unwrapKey"
    );
  }

  function encryptSecretKey(data, secretKey) {
    // Secret key will be recipient's public key
    return crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      secretKey,
      data //ArrayBuffer of data you want to encrypt
    );
  } 

  function decryptSecretKey(data, key) {
    // key will be my private key
    return crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
        //label: Uint8Array([...]) //optional
      },
      key,
      data //ArrayBuffer of the data
    );
  }

  function encryptMessage(data, secretKey, iv) {
    return crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        //Don't re-use initialization vectors!
        //Always generate a new iv every time your encrypt!
        iv: iv,
      },
      secretKey, //from generateKey or importKey above
      data //ArrayBuffer of data you want to encrypt
    );
  }

  function decryptMessage(data, secretKey, iv) {
    return crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv, //The initialization vector you used to encrypt
      },
      secretKey, //from generateKey or importKey above
      data //ArrayBuffer of the data
    );    
  }

  function importSecretKey(jwkData, format) {
    return crypto.subtle.importKey(
      format || "jwk", //can be "jwk" or "raw"
      //this is an example jwk key, "raw" would be an ArrayBuffer
      jwkData,
      {   //this is the algorithm options
        name: "AES-CBC",
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt", "decrypt"] //can be "encrypt", "decrypt", "wrapKey", or "unwrapKey"
    );
  }

  function importPrimaryKey(jwkData) {
    // Will be someone's public key
    return crypto.subtle.importKey(
      "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
      jwkData,
      {   //these are the algorithm options
        name: "RSA-OAEP",
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt"] //"encrypt" or "wrapKey" for public key import or
                  //"decrypt" or "unwrapKey" for private key imports
    );
  }

  function exportKey(key, format) {
    // Will be public primary key or public signing key
    return crypto.subtle.exportKey(
      format || "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
      key //can be a publicKey or privateKey, as long as extractable was true
    );   
  }

  function importSigningKey(jwkData) {
    return crypto.subtle.importKey(
      "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
      //this is an example jwk key, other key types are Uint8Array objects
      jwkData,
      {   //these are the algorithm options
        name: "RSASSA-PKCS1-v1_5",
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["verify"] //"verify" for public key import, "sign" for private key imports
    );
  }

  function signKey(data, keyToSignWith) {
    // Will use my private key
    return crypto.subtle.sign(
      {
        name: "RSASSA-PKCS1-v1_5"
      },
      keyToSignWith, //from generateKey or importKey above
      data //ArrayBuffer of data you want to sign
    );    
  }

  function verifyKey(signature, data, keyToVerifyWith) {
    // Will verify with sender's public key
    return crypto.subtle.verify(
      {
        name: "RSASSA-PKCS1-v1_5"
      },
      keyToVerifyWith, //from generateKey or importKey above
      signature, //ArrayBuffer of the signature
      data //ArrayBuffer of the data
    );  
  }

});
