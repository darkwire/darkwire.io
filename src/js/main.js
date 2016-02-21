import Darkwire from './darkwire';
import WindowHandler from './window';
import CryptoUtil from './crypto';

let fs = window.RequestFileSystem || window.webkitRequestFileSystem;

$(function() {
  const darkwire = new Darkwire();
  const cryptoUtil = new CryptoUtil();

  let FADE_TIME = 150; // ms
  let TYPING_TIMER_LENGTH = 400; // ms

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

  let username;
  let typing = false;
  let lastTypingTime;

  let roomId = window.location.pathname.length ? window.location.pathname : null;

  if (!roomId) { return; }

  $('input.share-text').val(document.location.protocol + '//' + document.location.host + roomId);

  $('input.share-text').click(function() {
    $(this).focus();
    $(this).select();
    this.setSelectionRange(0, 9999);
  });

  let socket = io(roomId);
  const windowHandler = new WindowHandler(darkwire, socket);

  FastClick.attach(document.body);

  function addParticipantsMessage(data) {
    let message = '';
    let headerMsg = '';

    $participants.text(data.numUsers);
  }

  // Sets the client's username
  function initChat() {
    username = window.username;
    // warn not incognitor
    if (!fs) {
      console.log('no fs');
    } else {
      fs(window.TEMPORARY,
        100,
        log.bind(log, 'WARNING: Your browser is not in incognito mode!'));
    }

    // If the username is valid
    if (username) {
      $chatPage.show();
      $inputMessage.focus();

      Promise.all([
        cryptoUtil.createPrimaryKeys()
      ])
      .then(function(data) {
        darkwire.keys = {
          public: data[0].publicKey,
          private: data[0].privateKey
        };
        return Promise.all([
          cryptoUtil.exportKey(data[0].publicKey, 'spki')
        ]);
      })
      .then(function(exportedKeys) {
        // Tell the server your username and send public keys
        socket.emit('add user', {
          username: username,
          publicKey: exportedKeys[0]
        });
      });
    }
  }

  // Log a message
  function log(message, options) {
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
  function addChatMessage(data, options) {
    if (!data.message.trim().length) {
      return;
    }

    let messageType = data.messageType || 'text';

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
    let $messageBodyDiv = $('<span class="messageBody">');
    // TODO: Ask client if accept/reject attachment
    // If reject, destroy object in memory
    // If accept, render image or content dispose
    if (messageType === 'file') {
      let image = new Image();
      image.src = `data:image/png;base64,${data.message}`;
      $messageBodyDiv.html(image);
    } else {
      $messageBodyDiv.html(data.message);
    }

    let typingClass = data.typing ? 'typing' : '';

    let $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping(data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping(data) {
    getTypingMessages(data).fadeOut(function() {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement(el, options) {
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
  function cleanInput(input) {
    let message = $('<div/>').html(input).text();
    message = Autolinker.link(message);
    return message;
  }

  // Updates the typing event
  function updateTyping() {
    if (darkwire.connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function() {
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
  function getTypingMessages(data) {
    return $('.typing.message').filter(function(i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor(username) {
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

  $window.keydown(function(event) {
    // When the client hits ENTER on their keyboard and chat message input is focused
    if (event.which === 13 && $('.inputMessage').is(':focus')) {
      handleMessageSending();
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
  $('.modal').on('hidden.bs.modal', function(e) {
    $inputMessage.focus();
  });

  // Select message input when clicking message body, unless selecting text
  $('.messages').on('click', function() {
    if (!getSelectedText()) {
      $inputMessage.focus();
    }
  });

  function getSelectedText() {
    var text = '';
    if (typeof window.getSelection != 'undefined') {
      text = window.getSelection().toString();
    } else if (typeof document.selection != 'undefined' && document.selection.type == 'Text') {
      text = document.selection.createRange().text;
    }
    return text;
  }

  // Whenever the server emits 'login', log the login message
  socket.on('user joined', function(data) {
    darkwire.connected = true;
    addParticipantsMessage(data);
    let importKeysPromises = darkwire.addUser(data);
    Promise.all(importKeysPromises).then(() => {
      // All users' keys have been imported
      if (data.numUsers === 1) {
        $('#first-modal').modal('show');
      }

      log(data.username + ' joined');
      renderParticipantsList();
    });

  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function(data) {
    darkwire.decodeMessage(data).then((data) => {
      if (!windowHandler.isActive) {
        windowHandler.notifyFavicon();
        darkwire.audio.play();
      }
      if (data.messageType === 'file') {
        // let file = windowHandler.fileHandler.decodeFile(data.message);
        // let chatMessage = {
        //   username: data.username,
        //   message: file
        // }
        addChatMessage(data, {messageType: 'file'});
      } else {
        addChatMessage(data);
      }
    });

  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function(data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);

    darkwire.removeUser(data);

    renderParticipantsList();
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function(data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function(data) {
    removeChatTyping(data);
  });

  initChat();

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
    _.each(darkwire.users, function(user) {
      let li;
      if (user.username === window.username) {
        // User is me
        li = $('<li>' + user.username + ' <span class="you">(you)</span></li>').css('color', getUsernameColor(user.username));
      } else {
        li = $('<li>' + user.username + '</li>').css('color', getUsernameColor(user.username));
      }
      $('#participants-modal ul.users')
        .append(li);
    });
  }

  $('#send-message-btn').click(function() {
    handleMessageSending();
    socket.emit('stop typing');
    typing = false;
  });

  $('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
  });

  let audioSwitch = $('input.bs-switch').bootstrapSwitch();

  audioSwitch.on('switchChange.bootstrapSwitch', function(event, state) {
    darkwire.audio.soundEnabled = state;
  });

  function handleMessageSending() {
    let message = $inputMessage;
    let cleanedMessage = cleanInput(message.val());
    // Prevent markup from being injected into the message
    darkwire.encodeMessage(cleanedMessage, 'text').then((socketData) => {
      message.val('');
      $('#send-message-btn').removeClass('active');
      addChatMessage({
        username: username,
        message: cleanedMessage
      });
      socket.emit('new message', socketData);
    }).catch((err) => {
      console.log(err);
    });
  }

});
