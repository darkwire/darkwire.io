import React from 'react';
import { Chat } from './Chat';

import { render, screen, fireEvent } from '@testing-library/react';

const translations = {
  typePlaceholder: 'inputplaceholder',
};

// Fake date
jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2020-03-14T11:01:58.135Z').valueOf());

test('Chat Component is displaying', () => {
  const { asFragment } = render(
    <Chat
      scrollToBottom={() => {}}
      focusChat={false}
      userId="foo"
      username="user"
      showNotice={() => {}}
      clearActivities={() => {}}
      sendEncryptedMessage={() => {}}
      translations={{}}
    />,
  );

  expect(asFragment()).toMatchSnapshot();
});

test('Can send message', () => {
  const sendEncryptedMessage = jest.fn();

  render(
    <Chat
      scrollToBottom={() => {}}
      focusChat={false}
      userId="foo"
      username="user"
      showNotice={() => {}}
      clearActivities={() => {}}
      sendEncryptedMessage={sendEncryptedMessage}
      translations={translations}
    />,
  );

  const textarea = screen.getByPlaceholderText(translations.typePlaceholder);

  // Validate but without text
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(sendEncryptedMessage).not.toHaveBeenCalled();

  // Type test
  fireEvent.change(textarea, { target: { value: 'test' } });
  // Validate
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(sendEncryptedMessage).toHaveBeenLastCalledWith({
    payload: { text: 'test', timestamp: 1584183718135 },
    type: 'TEXT_MESSAGE',
  });

  // Validate (should be empty)
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(sendEncryptedMessage).toHaveBeenCalledTimes(1);
});

test('Shift+enter prevent message sending', () => {
  const sendEncryptedMessage = jest.fn();

  render(
    <Chat
      scrollToBottom={() => {}}
      focusChat={false}
      userId="foo"
      username="user"
      showNotice={() => {}}
      clearActivities={() => {}}
      sendEncryptedMessage={sendEncryptedMessage}
      translations={translations}
    />,
  );

  const textarea = screen.getByPlaceholderText(translations.typePlaceholder);

  // Test shift effect
  fireEvent.change(textarea, { target: { value: 'test2' } });
  fireEvent.keyDown(textarea, { key: 'Shift' });
  fireEvent.keyDown(textarea, { key: 'Enter' });
  fireEvent.keyUp(textarea, { key: 'Shift' });

  expect(sendEncryptedMessage).toHaveBeenCalledTimes(0);

  // Now we want to send the message
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(sendEncryptedMessage).toHaveBeenCalledTimes(1);

  expect(sendEncryptedMessage).toHaveBeenLastCalledWith({
    payload: { text: 'test2', timestamp: 1584183718135 },
    type: 'TEXT_MESSAGE',
  });
});

test('Test commands', () => {
  const sendEncryptedMessage = jest.fn();
  const showNotice = jest.fn();
  const clearActivities = jest.fn();

  render(
    <Chat
      scrollToBottom={() => {}}
      focusChat={false}
      userId="foo"
      username="user"
      showNotice={showNotice}
      clearActivities={clearActivities}
      sendEncryptedMessage={sendEncryptedMessage}
      translations={translations}
    />,
  );

  const textarea = screen.getByPlaceholderText(translations.typePlaceholder);

  // Test /help
  fireEvent.change(textarea, { target: { value: '/help' } });
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(showNotice).toHaveBeenLastCalledWith({
    level: 'info',
    message: 'Valid commands: /clear, /help, /me, /nick',
  });

  // Test /me
  fireEvent.change(textarea, { target: { value: '/me action' } });
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(sendEncryptedMessage).toHaveBeenLastCalledWith({
    payload: { action: 'action' },
    type: 'USER_ACTION',
  });

  // Test /clear
  fireEvent.change(textarea, { target: { value: '/clear' } });
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(clearActivities).toHaveBeenLastCalledWith();

  // Test /nick/clear
  fireEvent.change(textarea, { target: { value: '/nick john!Th3Ripp&3r' } });
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(sendEncryptedMessage).toHaveBeenLastCalledWith({
    payload: { currentUsername: 'user', id: 'foo', newUsername: 'john-Th3Ripp-3r' },
    type: 'CHANGE_USERNAME',
  });

  // Test /nick
  fireEvent.change(textarea, { target: { value: '/nick' } });
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(showNotice).toHaveBeenLastCalledWith({
    level: 'error',
    message: 'Username cannot be blank, Username must start with a letter',
  });

  // Test /nick
  fireEvent.change(textarea, { target: { value: '/nick 3po' } });
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(showNotice).toHaveBeenLastCalledWith({
    level: 'error',
    message: 'Username must start with a letter',
  });

  // Test /nick
  fireEvent.change(textarea, { target: { value: '/nick 3po3ralotsofcrapscharactersforyourpleasureandnotmine' } });
  fireEvent.keyDown(textarea, { key: 'Enter' });

  expect(sendEncryptedMessage).toHaveBeenLastCalledWith({
    payload: { currentUsername: 'user', id: 'foo', newUsername: 'john-Th3Ripp-3r' },
    type: 'CHANGE_USERNAME',
  });
});
