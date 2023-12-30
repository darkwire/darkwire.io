import React from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html';
import { CornerDownRight } from 'react-feather';

import { hasTouchSupport } from '@/utils/dom';

import FileTransfer from '@/components/FileTransfer';

export const Chat = ({ sendEncryptedMessage, showNotice, userId, username, clearActivities, translations }) => {
  const [message, setMessage] = React.useState('');
  const [shiftKeyDown, setShiftKeyDown] = React.useState(false);
  const textInputRef = React.useRef();

  const touchSupport = hasTouchSupport;

  const canSend = message.trim().length;

  const commands = [
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
          return showNotice({
            message: `${errors.join(', ')}`,
            level: 'error',
          });
        }

        sendEncryptedMessage({
          type: 'CHANGE_USERNAME',
          payload: {
            id: userId,
            newUsername,
            currentUsername: username,
          },
        });
      },
    },
    {
      command: 'help',
      description: 'Shows a list of commands.',
      parameters: [],
      usage: '/help',
      scope: 'local',
      action: () => {
        const validCommands = commands.map(command => `/${command.command}`);
        showNotice({
          message: `Valid commands: ${validCommands.sort().join(', ')}`,
          level: 'info',
        });
      },
    },
    {
      command: 'me',
      description: 'Invoke virtual action',
      parameters: ['{action}'],
      usage: '/me {action}',
      scope: 'global',
      action: params => {
        const actionMessage = params.join(' ');
        if (!actionMessage.trim().length) {
          return false;
        }

        sendEncryptedMessage({
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
      parameters: [],
      usage: '/clear',
      scope: 'local',
      action: () => {
        clearActivities();
      },
    },
  ];

  const handleKeyUp = e => {
    if (e.key === 'Shift') {
      setShiftKeyDown(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Shift') {
      setShiftKeyDown(true);
    }
    if (e.key === 'Enter' && !hasTouchSupport && !shiftKeyDown) {
      e.preventDefault();
      if (canSend) {
        sendMessage();
      } else {
        setMessage('');
      }
    }
  };

  const executeCommand = command => {
    const commandToExecute = commands.find(cmnd => cmnd.command === command.command);

    if (commandToExecute) {
      const { params } = command;
      const commandResult = commandToExecute.action(params);

      return commandResult;
    }

    return null;
  };

  const handleSendClick = evt => {
    evt.preventDefault();
    sendMessage();
    textInputRef.current.focus();
  };

  const handleFormSubmit = evt => {
    evt.preventDefault();
    sendMessage();
  };

  const parseCommand = message => {
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
  };

  const sendMessage = () => {
    if (!canSend) {
      return;
    }

    const isCommand = parseCommand(message);

    if (isCommand) {
      const res = executeCommand(isCommand);
      if (res === false) {
        return;
      }
    } else {
      sendEncryptedMessage({
        type: 'TEXT_MESSAGE',
        payload: {
          text: message,
          timestamp: Date.now(),
        },
      });
    }

    setMessage('');
  };

  const handleInputChange = evt => {
    setMessage(evt.target.value);
  };

  return (
    <form onSubmit={handleFormSubmit} className="chat-preflight-container">
      <textarea
        rows="1"
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyPress}
        ref={textInputRef}
        autoFocus
        className="chat"
        value={message}
        placeholder={translations.typePlaceholder}
        onChange={handleInputChange}
      />
      <div className="input-controls">
        <FileTransfer sendEncryptedMessage={sendEncryptedMessage} />
        {touchSupport && (
          <button
            onClick={handleSendClick}
            className={`icon is-right send btn btn-link ${canSend ? 'active' : ''}`}
            title="Send"
          >
            <CornerDownRight className={canSend ? '' : 'disabled'} />
          </button>
        )}
      </div>
    </form>
  );
};

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
