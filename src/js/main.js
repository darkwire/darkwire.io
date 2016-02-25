import _ from 'underscore';
import Darkwire from './darkwire';
import WindowHandler from './window';
import CryptoUtil from './crypto';
import Chat from './chat';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
import he from 'he';

let fs = window.RequestFileSystem || window.webkitRequestFileSystem;

$(function() {
  const darkwire = new Darkwire();
  const cryptoUtil = new CryptoUtil();

  let $window = $(window);
  let $participants = $('#participants');

  let roomId = window.location.pathname.length ? window.location.pathname : null;

  if (!roomId) { return; }

  $('input.share-text').val(document.location.protocol + '//' + document.location.host + roomId);

  $('input.share-text').click(function() {
    $(this).focus();
    $(this).select();
    this.setSelectionRange(0, 9999);
  });

  let socket = io(roomId);
  const chat = new Chat(darkwire, socket);
  const windowHandler = new WindowHandler(darkwire, socket, chat);

  FastClick.attach(document.body);

  function addParticipantsMessage(data) {
    let message = '';
    let headerMsg = '';

    $participants.text(data.numUsers);
  }

  // Sets the client's username
  function initChat() {
    // warn not incognitor
    if (fs) {
      fs(window.TEMPORARY,
        100,
        () => {
          chat.log('Your browser is not in incognito mode!', {warning: true});
        });
    }
    chat.log(moment().format('MMMM Do YYYY, h:mm:ss a'), {info: true});
    darkwire.updateUsername(username).then((socketData) => {
      chat.chatPage.show();
      chat.inputMessage.focus();
      socket.emit('add user', socketData);
    });
  }

  // Prevents input from having injected markup
  function cleanInput(input) {
    input = input.replace(/\r?\n/g, '<br />');
    let sanitized = he.encode(input);
    sanitized = Autolinker.link(sanitized);
    return sanitized;
  }

  // Keyboard events

  $window.keydown(function(event) {
    // When the client hits ENTER on their keyboard and chat message input is focused
    if (event.which === 13 && !event.shiftKey && $('.inputMessage').is(':focus')) {
      handleMessageSending();
      socket.emit('stop typing');
      chat.typing = false;
      event.preventDefault();
    }

  });

  // Select message input when closing modal
  $('.modal').on('hidden.bs.modal', function(e) {
    chat.inputMessage.focus();
  });

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

      chat.log(data.username + ' joined');
      renderParticipantsList();
    });

  });

  socket.on('user update', (data) => {
    darkwire.updateUser(data).then((oldUsername) => {
      chat.log(oldUsername + ' changed name to ' + data.username);
      renderParticipantsList();
    });
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function(data) {
    darkwire.decodeMessage(data).then((decodedMessage) => {
      if (!windowHandler.isActive) {
        windowHandler.notifyFavicon();
        darkwire.audio.play();
      }

      let data = {
        username: decodedMessage.username,
        message: decodedMessage.message.text,
        messageType: decodedMessage.messageType,
        additionalData: decodedMessage.message.additionalData
      };
      chat.addChatMessage(data);
    });

  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function(data) {
    chat.log(data.username + ' left');
    addParticipantsMessage(data);
    chat.removeChatTyping(data);

    darkwire.removeUser(data);

    renderParticipantsList();
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function(data) {
    chat.addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function(data) {
    chat.removeChatTyping(data);
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
        li = $('<li>' + user.username + ' <span class="you">(you)</span></li>').css('color', chat.getUsernameColor(user.username));
      } else {
        li = $('<li>' + user.username + '</li>').css('color', chat.getUsernameColor(user.username));
      }
      $('#participants-modal ul.users')
        .append(li);
    });
  }

  $('#send-message-btn').click(function() {
    handleMessageSending();
    socket.emit('stop typing');
    chat.typing = false;
  });

  $('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
  });

  let audioSwitch = $('input.sound-enabled').bootstrapSwitch();

  audioSwitch.on('switchChange.bootstrapSwitch', function(event, state) {
    darkwire.audio.soundEnabled = state;
  });

  function handleMessageSending() {
    let message = chat.inputMessage;
    let cleanedMessage = cleanInput(message.val());
    let slashCommand = chat.parseCommand(cleanedMessage);

    if (slashCommand) {
      return chat.executeCommand(slashCommand, this);
    }

    // Prevent markup from being injected into the message
    darkwire.encodeMessage(cleanedMessage, 'text').then((socketData) => {
      message.val('');
      $('#send-message-btn').removeClass('active');
      chat.addChatMessage({
        username: username,
        message: cleanedMessage
      });
      socket.emit('new message', socketData);
    }).catch((err) => {
      console.log(err);
    });
  }

  window.triggerFileTransfer = function(context) {
    const fileId = context.getAttribute('data-file');
    if (fileId) {
      return windowHandler.fileHandler.encodeFile(fileId);
    }

    return chat.log('Requested file transfer is no longer valid. Please try again.', {error: true});
  };

  window.triggerFileDestroy = function(context) {
    const fileId = context.getAttribute('data-file');
    if (fileId) {
      return windowHandler.fileHandler.destroyFile(fileId);
    }

    return chat.log('Requested file transfer is no longer valid. Please try again.', {error: true});
  };

  window.triggerFileDownload = function(context) {
    const fileId = context.getAttribute('data-file');
    const file = darkwire.getFile(fileId);
    windowHandler.fileHandler.createBlob(file.message, file.messageType).then((blob) => {
      let url = windowHandler.fileHandler.createUrlFromBlob(blob);

      if (file) {
        if (file.messageType.match('image.*')) {
          let image = new Image();
          image.src = url;
          chat.replaceMessage('#file-transfer-request-' + fileId, image);
        } else {
          let downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.target = '_blank';
          downloadLink.innerHTML = 'Download ' + file.additionalData.fileName;
          chat.replaceMessage('#file-transfer-request-' + fileId, downloadLink);
        }
      }

      darkwire.encodeMessage('Downloaded ' + file.additionalData.fileName, 'text').then((socketData) => {
        socket.emit('new message', socketData);
      }).catch((err) => {
        console.log(err);
      });

    });
  };

});
