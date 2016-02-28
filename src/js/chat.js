import _ from 'underscore';
import sanitizeHtml from 'sanitize-html';
import he from 'he';

// TODO: Remove in v2.0
let warned = false;

export default class Chat {
  constructor(darkwire, socket) {
    this.usernamesInMemory = [];
    this.FADE_TIME = 150; // ms
    this.TYPING_TIMER_LENGTH = 400; // ms
    this.typing = false;
    this.lastTypingTime = null;
    this.darkwire = darkwire;
    this.socket = socket;
    this.messages = $('.messages'); // Messages area
    this.inputMessage = $('.inputMessage'); // Input message input box
    this.chatPage = $('.chat.page');
    this.bindEvents();
  }

  clear() {
    let chatArea = $('.messages');
    return chatArea.fadeOut(200, () => { chatArea.empty().show(); });
  }

  // Log a message
  log(message, options) {
    let html = options && options.html === true || false;
    let classNames = options && options.classNames ? options.classNames : '';
    let $el;

    let matchedUsernames = this.checkIfUsername(message.split(' '));

    if (matchedUsernames.length > 0) {
      for (let i = 0; i < matchedUsernames.length; i++) {
        let usernameContainer = $('<span/>')
          .text(matchedUsernames[i])
          .css('color', this.getUsernameColor(matchedUsernames[i]));

        // Match only the username
        let matchedUsernameOnly = new RegExp('(' + matchedUsernames[i] + ')(?![^<]*>|[^<>]*<\/)', 'gm');
        message = message.replace(matchedUsernameOnly, usernameContainer.prop('outerHTML'));
      }
    }

    if (options && options.error) {
      $el = $('<li class="log-error">').addClass(`log ${classNames}`).html('ERROR: ' + message);
    } else if (options && options.warning)  {
      $el = $('<li class="log-warning">').addClass(`log ${classNames}`).html('WARNING: ' + message);
    } else if (options && options.notice) {
      $el = $('<li class="log-info">').addClass(`log ${classNames}`).html('NOTICE: ' + message);
    }  else if (options && options.info) {
      $el = $('<li class="log-info">').addClass(`log ${classNames}`).html(message);
    } else {
      $el = $('<li>').addClass(`log ${classNames}`).html(message);
    }

    this.addMessageElement($el, options);
  }

  checkIfUsername(words) {
    let matchedUsernames = [];
    this.darkwire.users.forEach((user) => {
      let usernameMatch = new RegExp('^' + user.username + '$');
      for (let i = 0; i < words.length; i++) {
        let exactMatch = words[i].match(usernameMatch) || false;
        let usernameInMemory = this.usernamesInMemory.indexOf(words[i]) > -1;

        if (exactMatch && exactMatch.length > -1 || usernameInMemory) {
          if (!usernameInMemory) {
            this.usernamesInMemory.push(words[i]);
          }
          matchedUsernames.push(words[i]);
        }
      }
    });
    return matchedUsernames;
  }

  // Gets the color of a username through our hash function
  getUsernameColor(username) {
    const COLORS = [
      '#e21400', '#ffe400', '#ff8f00',
      '#58dc00', '#dd9cff', '#4ae8c4',
      '#3b88eb', '#f47777', '#EEACB7',
      '#D3FF3E', '#99CC33', '#999933',
      '#996633', '#B8D5B8', '#7FFF38',
      '#FADBBC', '#FAE2B7', '#EBE8AF',
    ];
    // Compute hash code
    let hash = 7;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    let index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  bindEvents() {
    var _this = this;
    // Select message input when clicking message body, unless selecting text
    this.messages.on('click', () => {
      if (!this.getSelectedText()) {
        this.inputMessage.focus();
      }
    });

    this.inputMessage.on('input propertychange paste change', function() {
      _this.updateTyping();
      let message = $(this).val().trim();
      if (message.length) {
        $('#send-message-btn').addClass('active');
      } else {
        $('#send-message-btn').removeClass('active');
      }
    });
  }

  // Updates the typing event
  updateTyping() {
    if (this.darkwire.connected) {
      if (!this.typing) {
        this.typing = true;
        this.socket.emit('typing');
      }
      this.lastTypingTime = (new Date()).getTime();

      setTimeout(() => {
        let typingTimer = (new Date()).getTime();
        let timeDiff = typingTimer - this.lastTypingTime;
        if (timeDiff >= this.TYPING_TIMER_LENGTH && this.typing) {
          this.socket.emit('stop typing');
          this.typing = false;
        }
      }, this.TYPING_TIMER_LENGTH);
    }
  }

  addChatTyping(data) {
    data.typing = true;
    data.message = 'is typing';
    this.addChatMessage(data);
  }

  getSelectedText() {
    let text = '';
    if (typeof window.getSelection != 'undefined') {
      text = window.getSelection().toString();
    } else if (typeof document.selection != 'undefined' && document.selection.type == 'Text') {
      text = document.selection.createRange().text;
    }
    return text;
  }

  getTypingMessages(data) {
    return $('.typing.message').filter(function(i) {
      return $(this).data('username') === data.username;
    });
  }

  removeChatTyping(data) {
    this.getTypingMessages(data).fadeOut(function() {
      $(this).remove();
    });
  }

  slashCommands(trigger) {
    let validCommands = [];
    let expectedParams = 0;
    const triggerCommands = [{
      command: 'nick',
      description: 'Changes nickname.',
      paramaters: ['{username}'],
      multiple: false,
      usage: '/nick {username}',
      action: () => {

        let newUsername = trigger.params[0] || false;

        if (newUsername.toString().length > 16) {
          return this.log('Username cannot be greater than 16 characters.', {error: true});
        }

        // Remove things that arent digits or chars
        newUsername = newUsername.replace(/[^A-Za-z0-9]/g, '-');

        if (!newUsername.match(/^[A-Z]/i)) {
          return this.log('Username must start with a letter.', {error: true});
        }

        if (!warned) {
          warned = true;
          return this.log('Changing your username is currently in beta and your new username will be sent over the wire in plain text, unecrypted. This will be fixed in v2.0. If you really want to do this, type the command again.',
          {
            warning: true,
            classNames: 'change-username-warning'
          });
        }

        this.darkwire.updateUsername(newUsername).then((socketData) => {
          let modifiedSocketData = {
            username: window.username,
            newUsername: socketData.username
          };

          this.socket.emit('update user', modifiedSocketData);
          window.username = username = socketData.username;
        }).catch((err) => {
          return this.log(err, {error: true});
        });
      }
    }, {
      command: 'help',
      description: 'Shows a list of commands.',
      paramaters: [],
      multiple: false,
      usage: '/help',
      action: () => {
        validCommands = validCommands.map((command) => {
          return '/' + command;
        });

        this.log('Valid commands: ' + validCommands.sort().join(', '), {notice: true});
      }
    }, {
      command: 'me',
      description: 'Invoke virtual action',
      paramaters: ['{action}'],
      multiple: true,
      usage: '/me {action}',
      action: () => {

        expectedParams = 100;

        let actionMessage = trigger.params.join(' ');

        this.darkwire.encodeMessage(actionMessage, 'action').then((socketData) => {
          this.addChatMessage({
            username: username,
            message: actionMessage,
            messageType: 'action'
          });
          this.socket.emit('new message', socketData);
        }).catch((err) => {
          console.log(err);
        });
      }
    }, {
      command: 'clear',
      description: 'Clears the chat screen',
      paramaters: [],
      multiple: true,
      usage: '/clear',
      action: () => {
        this.clear();
      }
    }];

    const color = () => {
      const hexTex = new RegExp(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i);
    };

    triggerCommands.forEach((command) => {
      validCommands.push(command.command);
    });

    let commandToTrigger = _.findWhere(triggerCommands, {command: trigger.command});

    if (commandToTrigger) {
      expectedParams = commandToTrigger.paramaters.length;
      if (expectedParams && trigger.params.length > expectedParams || expectedParams && trigger.params.length < expectedParams) {
        if ((!commandToTrigger.multple && trigger.params.length < 1) || (trigger.params.length >= 1 && trigger.params[0] === '')) {
          return this.log('Missing or too many paramater. Usage: ' + commandToTrigger.usage, {error: true});
        }
      }

      return commandToTrigger.action.call();
    }

    this.log(trigger.command + ' is not a valid command. Type /help for a list of valid commands.', {error: true});
    return false;
  }

  executeCommand(trigger) {
    trigger = trigger || false;
    if (trigger) {
      let command = trigger.command;
      this.slashCommands(trigger);
    }
  }

  parseCommand(cleanedMessage) {
    let trigger = {
      command: null,
      params: []
    };

    if (cleanedMessage.indexOf('/') === 0) {
      this.inputMessage.val('');
      let parsedCommand = cleanedMessage.replace('/', '').split(' ');
      trigger.command = sanitizeHtml(parsedCommand[0]) || null;
      // Get params
      if (parsedCommand.length >= 2) {
        for (let i = 1; i < parsedCommand.length; i++) {
          trigger.params.push(parsedCommand[i]);
        }
      }

      return trigger;
    }

    return false;
  }

  addChatMessage(data, options) {
    if (!data.message.trim().length) {
      return;
    }

    let messageType = data.messageType || 'text';

    // Don't fade the message in if there is an 'X was typing'
    let $typingMessages = this.getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    let $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', this.getUsernameColor(data.username));

    let $messageBodyDiv = $('<span class="messageBody">');

    if (messageType === 'text' || messageType === 'action') {
      if (messageType === 'action') {
        $usernameDiv.css('color','').prepend('*');
      }
      let unescapedMessage = unescape(data.message);
      let lineBreaks = /&#x3C;br \/&#x3E;/g;
      unescapedMessage = unescapedMessage.replace(lineBreaks, '<br />');
      $messageBodyDiv.html(unescapedMessage);
    } else {
      $messageBodyDiv.html(this.darkwire.addFileToQueue(data));
    }

    let typingClass = data.typing ? 'typing' : '';
    let actionClass = data.messageType === 'action' ? 'action' : '';

    let $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .addClass(actionClass)
      .append($usernameDiv, $messageBodyDiv);

    this.addMessageElement($messageDiv, options);
  }

  addMessageElement(el, options) {
    let $el = $(el);

    if (!options) {
      options = {};
    }

    $el.hide().fadeIn(this.FADE_TIME);
    this.messages.append($el);

    this.messages[0].scrollTop = this.messages[0].scrollHeight; // minus 60 for key
  }

  replaceMessage(id, message) {
    let container = $(id);
    if (container) {
      container.html(message);
    }
  }

}
