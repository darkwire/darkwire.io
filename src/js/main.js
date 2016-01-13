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
  let COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  let $window = $(window);
  let $usernameInput = $('.usernameInput'); // Input for username
  let $messages = $('.messages'); // Messages area
  let $inputMessage = $('.inputMessage'); // Input message input box
  let $key = $('.key');
  let $genKey = $('.new_key');
  let $participants = $('#participants');

  let $chatPage = $('.chat.page'); // The chatroom page

  let users = [];

  // Prompt for setting a username
  let username;
  let connected = false;
  let typing = false;
  let lastTypingTime;
  let $currentInput = $usernameInput.focus();
  let encryptionKey;

  let clipboard = new Clipboard('.copyable');

  let roomId = window.location.pathname.length ? window.location.pathname : null;

  if (!roomId) return;

  let socket = io(roomId);
  $('#roomIdKey').text(roomId.replace('/', ''));

  function addParticipantsMessage (data) {
    let message = '';
    let headerMsg = '';

    $participants.text(data.numUsers);
  }

  // Sets the client's username
  function setUsername () {
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
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    // Don't allow sending if key is empty
    if (!encryptionKey.trim().length) return;

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
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', encrypt(message));
    }
  }

  function encrypt(text) {
    return CryptoJS.AES.encrypt(text, $key.val()).toString();
  }

  function decrypt(text) {
    return CryptoJS.AES.decrypt(text, $key.val()).toString(CryptoJS.enc.Utf8) || text;
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

    // If enter is pressed on key input then close key modal
    if (event.which === 13 && $('#join-modal input').is(':focus')) {
      checkJoinKey();
    }

    // If enter is pressed on edit key input
    if (event.which === 13 && $('#settings-modal .edit-key input.key').is(':focus')) {
      saveKey();
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

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  $genKey.click(function () {
    let key = generatePassword();
    updateKeyVal(key);
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    addParticipantsMessage(data);

    users = data.users;

    let key = generatePassword();

    if (data.numUsers > 1) {
      $('#join-modal').modal('show');
      $('#join-modal').on('shown.bs.modal', function (e) {
        $('#join-modal input').focus();
      });

      key = '';
    }
    updateKeyVal(key);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    // Don't show messages if no key

    if (!isActive) {
      newMessages++;
      favicon.badge(newMessages);
      if (beep) {
        beep.play();
      }
    }
    data.message = decrypt(data.message);
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);

    users = data.users;  
    renderParticipantsList();
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);

    users = data.users;

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

  socket.on('first', function() {
    $('#first-modal').modal('show');
  });

  setUsername();

  window.onfocus = function () { 
    isActive = true;
    newMessages = 0;
    favicon.reset();
  }; 

  window.onblur = function () { 
    isActive = false;
  };

  clipboard.on('success', function(e) {
    $(e.trigger).tooltip({
      title: 'Copied!',
      trigger: 'manual',
      placement: 'auto'
    });
    $(e.trigger).tooltip('show');
    setTimeout(function() {
      $(e.trigger).tooltip('hide');
    }, 2000);
    e.clearSelection();
  });

  clipboard.on('error', function(e) {
    $(e.trigger).tooltip({
      title: 'Press ⌘C to copy',
      trigger: 'manual',
      placement: 'auto'
    });
    $(e.trigger).tooltip('show');
    setTimeout(function() {
      $(e.trigger).tooltip('hide');
    }, 2000);
  });

  // Nav links
  $('a#settings-nav').click(function() {
    $('#settings-modal').modal('show');
  });

  $('a#about-nav').click(function() {
    $('#about-modal').modal('show');
  });

  $('.room-url').text('https://fatty.chat' + roomId);
  $('.room-id').text(roomId.replace('/', ''));

  $('[data-toggle="tooltip"]').tooltip();

  function joinKeyInputChanged(val) {
    if (!val.trim().length) {
      $('#join-modal .modal-footer button').attr('disabled', 'disabled');
    } else {
      $('#join-modal .modal-footer button').removeAttr('disabled');
    }    
  }

  $('#join-modal .key').on('input propertychange paste change', function() {
    let val = $(this).val().trim();
    joinKeyInputChanged(val);
  });

  $('#settings-modal input.key').on('input propertychange paste change', function() {
    let val = $(this).val().trim();
    if (val !== encryptionKey && val.length) {
      $('#settings-modal #save-key-edit').removeAttr('disabled');
    } else {
      $('#settings-modal #save-key-edit').attr('disabled', 'disabled');
    }
  });

  $('.navbar .participants').click(function() {
    renderParticipantsList();
    $('#participants-modal').modal('show');
  });

  function renderParticipantsList() {
    $('#participants-modal ul.users').empty();
    _.each(users, function(username) {
      let li;
      if (username === window.username) {
        // User is me
        li = $("<li>" + username + " <span class='you'>(you)</span></li>").css('color', getUsernameColor(username));
      } else {
        li = $("<li>" + username + "</li>").css('color', getUsernameColor(username));
      }
      $('#participants-modal ul.users')
        .append(li);        
    });    
  }

  function updateKeyVal(val) {
    $('.key').val(val);
    $('.key').text(val);   
    encryptionKey = val;
  }

  // Prevent closing join-modal
  $('#join-modal').modal({
    backdrop: 'static',
    show: false,
    keyboard: false
  });

  $('.read-key').click(function() {
    $('.edit-key').show();
    $('.edit-key input').focus();
    $(this).hide();
  });

  $('.edit-key #cancel-key-edit').click(function() {
    cancelSaveKey();
  });

  $('.edit-key #save-key-edit').click(function() {
    saveKey();
  });

  function cancelSaveKey() {
    $('.edit-key').hide();
    $('.read-key').show();
    updateKeyVal(encryptionKey);    
  }

  function saveKey() {
    let key = $('.edit-key input.key').val().trim();
    if (!key.length) return;    
    $('.edit-key').hide();
    $('.read-key').show();
    updateKeyVal(key || encryptionKey);    
  }

  $('#join-modal .modal-footer button').click(function() {
    checkJoinKey();
  });

  function checkJoinKey() {
    let key = $('#join-modal input').val().trim();
    if (!key.length) return;
    updateKeyVal(key);
    $('#join-modal').modal('hide');
  }

  $('#settings-modal').on('hide.bs.modal', function (e) {
    cancelSaveKey();
  });

  $('#send-message-btn').click(function() {
    sendMessage();
    socket.emit('stop typing');
    typing = false;
  });

  function generatePassword() {
    let length = 16;
    const charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

});
