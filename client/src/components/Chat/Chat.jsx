import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html';
import { CornerDownRight } from 'react-feather';

import { getSelectedText, hasTouchSupport } from '@/utils/dom';

import FileTransfer from '@/components/FileTransfer';

export class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      touchSupport: hasTouchSupport,
      shiftKeyDown: false,
    };

    this.commands = [
      {
        command: 'nick',
        description: 'Changes nickname.',
        parameters: ['{username}'],
        usage: '/nick {username}',
        scope: 'global',
        action: params => {
          // eslint-disable-line
          let newUsername = params.join(' ') || ''; // eslint-disable-line

          // Remove things that aren't digits or chars
          newUsername = newUsername.replace(/[^A-Za-z0-9]/g, '-');

          const errors = [];

          if (!newUsername.trim().length) {
            errors.push('Username cannot be blank');
          }

          if (newUsername.toString().length > 16) {
            errors.push('Username cannot be greater than 16 characters');
          }

          if (!newUsername.match(/^[A-Z]/i)) {
            errors.push('Username must start with a letter');
          }

          if (errors.length) {
            return this.props.showNotice({
              message: `${errors.join(', ')}`,
              level: 'error',
            });
          }

          this.props.sendEncryptedMessage({
            type: 'CHANGE_USERNAME',
            payload: {
              id: this.props.userId,
              newUsername,
              currentUsername: this.props.username,
            },
          });
        },
      },
      {
        command: 'help',
        description: 'Shows a list of commands.',
        paramaters: [],
        usage: '/help',
        scope: 'local',
        action: params => {
          // eslint-disable-line
          const validCommands = this.commands.map(command => `/${command.command}`);
          this.props.showNotice({
            message: `Valid commands: ${validCommands.sort().join(', ')}`,
            level: 'info',
          });
        },
      },
      {
        command: 'me',
        description: 'Invoke virtual action',
        paramaters: ['{action}'],
        usage: '/me {action}',
        scope: 'global',
        action: params => {
          // eslint-disable-line
          const actionMessage = params.join(' ');
          if (!actionMessage.trim().length) {
            return false;
          }

          this.props.sendEncryptedMessage({
            type: 'USER_ACTION',
            payload: {
              action: actionMessage,
            },
          });
        },
      },
      {
        command: 'clear',
        description: 'Clears the chat screen',
        paramaters: [],
        usage: '/clear',
        scope: 'local',
        action: (params = null) => {
          // eslint-disable-line
          this.props.clearActivities();
        },
      },
    ];
  }

  componentDidMount() {
    if (!hasTouchSupport) {
      // Disable for now due to vary issues:
      // Paste not working, shift+enter line breaks
      // autosize(this.textInput);
      this.textInput.addEventListener('autosize:resized', () => {
        this.props.scrollToBottom();
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.focusChat) {
      if (!getSelectedText()) {
        // Don't focus for now, evaluate UX benfits
        // this.textInput.focus()
      }
    }
  }

  componentDidUpdate(nextProps, nextState) {
    if (!nextState.message.trim().length) {
      // autosize.update(this.textInput)
    }
  }

  handleKeyUp(e) {
    if (e.key === 'Shift') {
      this.setState({
        shiftKeyDown: false,
      });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Shift') {
      this.setState({
        shiftKeyDown: true,
      });
    }
    // Fix when autosize is enabled - line breaks require shift+enter twice
    if (e.key === 'Enter' && !hasTouchSupport && !this.state.shiftKeyDown) {
      e.preventDefault();
      if (this.canSend()) {
        this.sendMessage();
      } else {
        this.setState({
          message: '',
        });
      }
    }
  }

  executeCommand(command) {
    const commandToExecute = this.commands.find(cmnd => cmnd.command === command.command);

    if (commandToExecute) {
      const { params } = command;
      const commandResult = commandToExecute.action(params);

      return commandResult;
    }

    return null;
  }

  handleSendClick() {
    this.sendMessage.bind(this);
    this.textInput.focus();
  }

  handleFormSubmit(evt) {
    evt.preventDefault();
    this.sendMessage();
  }

  parseCommand(message) {
    const commandTrigger = {
      command: null,
      params: [],
    };

    if (message.charAt(0) === '/') {
      const parsedCommand = message.replace('/', '').split(' ');
      commandTrigger.command = sanitizeHtml(parsedCommand[0]) || null;
      // Get params
      if (parsedCommand.length >= 2) {
        for (let i = 1; i < parsedCommand.length; i++) {
          commandTrigger.params.push(parsedCommand[i]);
        }
      }

      return commandTrigger;
    }

    return false;
  }

  sendMessage() {
    if (!this.canSend()) {
      return;
    }

    const { message } = this.state;
    const isCommand = this.parseCommand(message);

    if (isCommand) {
      const res = this.executeCommand(isCommand);
      if (res === false) {
        return;
      }
    } else {
      this.props.sendEncryptedMessage({
        type: 'TEXT_MESSAGE',
        payload: {
          text: message,
          timestamp: Date.now(),
        },
      });
    }

    this.setState({
      message: '',
    });
  }

  handleInputChange(evt) {
    this.setState({
      message: evt.target.value,
    });
  }

  canSend() {
    return this.state.message.trim().length;
  }

  render() {
    const touchSupport = this.state.touchSupport;

    return (
      <form onSubmit={this.handleFormSubmit.bind(this)} className="chat-preflight-container">
        <textarea
          rows="1"
          onKeyUp={this.handleKeyUp.bind(this)}
          onKeyDown={this.handleKeyPress.bind(this)}
          ref={input => {
            this.textInput = input;
          }}
          autoFocus
          className="chat"
          value={this.state.message}
          placeholder={this.props.translations.typePlaceholder}
          onChange={this.handleInputChange.bind(this)}
        />
        <div className="input-controls">
          <FileTransfer sendEncryptedMessage={this.props.sendEncryptedMessage} />
          {touchSupport && (
            <button
              onClick={this.handleSendClick.bind(this)}
              className={`icon is-right send btn btn-link ${this.canSend() ? 'active' : ''}`}
              title="Send"
            >
              <CornerDownRight className={this.canSend() ? '' : 'disabled'} />
            </button>
          )}
        </div>
      </form>
    );
  }
}

Chat.propTypes = {
  sendEncryptedMessage: PropTypes.func.isRequired,
  showNotice: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  clearActivities: PropTypes.func.isRequired,
  focusChat: PropTypes.bool.isRequired,
  scrollToBottom: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};

export default Chat;
