import _ from 'underscore';
import Darkwire from './darkwire';
import WindowHandler from './window';
import Chat from './chat';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
import uuid from 'uuid';
import he from 'he';

export default class App {

  constructor() {
    this._roomId = window.location.pathname.length ? this.stripName(window.location.pathname) : null;
    this._darkwire = new Darkwire();
    this._socket = io(this._roomId);
    this._darkwire.connected = false;
    this.init();
  }

  stripName(name) {
    const chatName = name.replace('/','').toLowerCase().replace(/[^A-Za-z0-9]/g, '-');
    if (chatName.length >= 50) {
      const limitedChatName = chatName.substr(0, 50);
      window.history.replaceState({}, limitedChatName, `/${limitedChatName}`);
      return `/${limitedChatName}`;
    }

    return '/' + chatName;
  }

  init() {
    this._chat = new Chat(this._darkwire, this._socket);

    if (!this._roomId) { return; }

    $('input.share-text').val(document.location.protocol + '//' + document.location.host + this._roomId);

    $('input.share-text').click(() => {
      $(this).focus();
      $(this).select();
    });

    const windowHandler = new WindowHandler(this._darkwire, this._socket, this._chat);

    FastClick.attach(document.body);

    // Select message input when closing modal
    $('.modal').on('hidden.bs.modal', (e) => {
      this._chat.inputMessage.focus();
    });

    this._socket.on('rated', () => {
      this._chat.log('You are sending messages to fast, please slow down. Your last message was ignored.', {
        error: true,
      });
    });

    // Whenever the server emits 'login', log the login message
    this._socket.on('user joined', (data) => {
      this._darkwire.connected = true;
      this.addParticipantsMessage(data);
      let importKeysPromises = this._darkwire.addUser(data);
      Promise.all(importKeysPromises).then(() => {
        // All users' keys have been imported
        if (data.numUsers === 1) {
          //$('#first-modal').modal('show');
        }

        this._chat.log(data.username + ' joined');
        this.renderParticipantsList();
      });

    });

    this._socket.on('user update', (data) => {
      this._darkwire.updateUser(data).then((oldUsername) => {
        this._chat.log(oldUsername + ' <span>changed name to</span> ' + data.username,
          {
            classNames: 'changed-name'
          });
        this.renderParticipantsList();
      });
    });

    // Whenever the server emits 'new message', update the chat body
    this._socket.on('new message', (data) => {
      this._darkwire.decodeMessage(data).then((decodedMessage) => {
        if (!windowHandler.isActive) {
          windowHandler.notifyFavicon();
          this._darkwire.audio.play();
        }

        let data = {
          username: decodedMessage.username,
          message: decodedMessage.message.text,
          messageType: decodedMessage.messageType,
          additionalData: decodedMessage.message.additionalData
        };
        this._chat.addChatMessage(data);
      });

    });

    // Whenever the server emits 'user left', log it in the chat body
    this._socket.on('user left', (data) => {
      this._chat.log(data.username + ' left');
      this.addParticipantsMessage(data);
      this._chat.removeChatTyping(data);

      this._darkwire.removeUser(data);

      this.renderParticipantsList();
    });

    // Whenever the server emits 'typing', show the typing message
    this._socket.on('typing', (data) => {
      this._chat.addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    this._socket.on('stop typing', (data) => {
      this._chat.removeChatTyping(data);
    });

    this._socket.on('disconnect', (data) => {
      this._darkwire.connected = false;
      this._chat.log('Disconnected from server, automatically reconnecting in 4 seconds.', {
        error: true,
      });
      this.retryConnection();
    });

    this.initChat();

    // Nav links
    $('a#settings-nav').click(() => {
      $('#settings-modal').modal('show');
    });

    $('a#about-nav').click(() => {
      $('#about-modal').modal('show');
    });

    $('.navbar .participants').click(() => {
      this.renderParticipantsList();
      $('#participants-modal').modal('show');
    });

    $('#send-message-btn').click(() => {
      handleMessageSending();
      this._socket.emit('stop typing');
      this._chat.typing = false;
    });

    $('.navbar-collapse ul li a').click(() => {
      $('.navbar-toggle:visible').click();
    });

    let audioSwitch = $('input.sound-enabled').bootstrapSwitch();

    audioSwitch.on('switchChange.bootstrapSwitch', (event, state) => {
      this._darkwire.audio.soundEnabled = state;
    });

    window.handleMessageSending = () => {
      let message = this._chat.inputMessage;
      let cleanedMessage = this.cleanInput(message.val());
      let slashCommand = this._chat.parseCommand(cleanedMessage);

      if (slashCommand) {
        return this._chat.executeCommand(slashCommand, this);
      }

      // Prevent markup from being injected into the message
      this._darkwire.encodeMessage(cleanedMessage, 'text').then((socketData) => {
        message.val('');
        $('#send-message-btn').removeClass('active');
        // Add escaped message since message did not come from the server
        this._chat.addChatMessage({
          username: username,
          message: escape(cleanedMessage)
        });
        this._socket.emit('new message', socketData);
      }).catch((err) => {
        console.log(err);
      });
    };

    window.triggerFileTransfer = (context) => {
      const fileId = context.getAttribute('data-file');
      if (fileId) {
        return windowHandler.fileHandler.encodeFile(fileId);
      }

      return this._chat.log('Requested file transfer is no longer valid. Please try again.', {error: true});
    };

    window.triggerFileDestroy = (context) => {
      const fileId = context.getAttribute('data-file');
      if (fileId) {
        return windowHandler.fileHandler.destroyFile(fileId);
      }

      return this._chat.log('Requested file transfer is no longer valid. Please try again.', {error: true});
    };

    window.triggerFileDownload = (context) => {
      const fileId = context.getAttribute('data-file');
      const file = this._darkwire.getFile(fileId);
      windowHandler.fileHandler.createBlob(file.message, file.messageType).then((blob) => {
        let url = windowHandler.fileHandler.createUrlFromBlob(blob);

        if (file) {
          if (file.messageType.match('image.*')) {
            let image = new Image();
            image.src = url;
            this._chat.replaceMessage('#file-transfer-request-' + fileId, image);
          } else {
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.target = '_blank';
            downloadLink.innerHTML = 'Download ' + file.additionalData.fileName;
            this._chat.replaceMessage('#file-transfer-request-' + fileId, downloadLink);
          }
        }

        this._darkwire.encodeMessage('Accepted <strong>' + file.additionalData.fileName + '</strong>', 'text').then((socketData) => {
          this._socket.emit('new message', socketData);
        }).catch((err) => {
          console.log(err);
        });

      });
    };
  }

  // Prevents input from having injected markup
  cleanInput(input) {
    input = input.replace(/\r?\n/g, '<br />');
    return this.autolinker(he.encode(input));
  }

  // Adds rel=noopener noreferrer to autolinked links (Addresses #46 from @Mickael-van-der-Beek)
  autolinker(sanitized) {
    return Autolinker.link(sanitized, {
      replaceFn: function(match) {
        const tag = match.buildTag();
        tag.setAttr('rel', 'noopener noreferrer');

        return tag;
      }
    });
  }

  // Sets the client's username
  initChat() {

    // Warn if not incognito
    // FileSystem API is disabled in incognito mode, so we can use that to check
    let fs = window.requestFileSystem || window.webkitRequestFileSystem;
    if (fs) {
      fs(window.TEMPORARY, 100, () => {
        //this._chat.log('Your browser is not in incognito mode!', {warning: true});
      });
    }

    this._chat.log(moment().format('MMMM Do YYYY, h:mm:ss a'), {info: true});
    
    $('#roomName').text(this._roomId);
    $('#chatNameModal').text(this._roomId);

    this._darkwire.updateUsername(username).then((socketData) => {
      this._chat.chatPage.show();
      this._chat.inputMessage.focus();
      this._socket.emit('add user', socketData);
    });

    $('#newRoom').on('click', (e) => {
      e.preventDefault();
      const newWindow = window.open();
      newWindow.opener = null;
      newWindow.location = window.location.protocol + '//' + window.location.host + '/' + uuid.v4().replace(/-/g,'');
    });
  }

  addParticipantsMessage(data) {
    let message = '';
    let headerMsg = '';
    const {numUsers} = data;

    if (numUsers === 0) {
      window.location.reload();
    }

    $('#participants').text(numUsers);
  }

  renderParticipantsList() {
    $('#participants-modal ul.users').empty();
    _.each(this._darkwire.users, (user) => {
      let li;
      if (user.username === window.username) {
        // User is me
        li = $('<li class="yourself">' + user.username + ' <span class="you">(you)</span></li>').css('color', this._chat.getUsernameColor(user.username));
      } else {
        li = $('<li>' + user.username + '</li>').css('color', this._chat.getUsernameColor(user.username));
      }
      $('#participants-modal ul.users')
        .append(li);
    });
  }

  retryConnection() {
    window.setTimeout(() => {
      window.location.reload();
    }, 4000);
  }

}
