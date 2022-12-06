import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { Chat } from '@/components/Chat/Chat';

import * as dom from '@/utils/dom';

const translations = {
  typePlaceholder: 'inputplaceholder',
};

// Fake date
vi.spyOn(global.Date, 'now').mockImplementation(() => new Date('2020-03-14T11:01:58.135Z').valueOf());

// To change touch support
vi.mock('@/utils/dom');

describe('Chat component', () => {
  afterEach(() => {
    // Reset touch support
    dom.hasTouchSupport = false;
  });

  it('should display', () => {
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

  it('can send message', () => {
    const sendEncryptedMessage = vi.fn();

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

    // Validate (textarea should be empty)
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(sendEncryptedMessage).toHaveBeenCalledTimes(1);
  });

  it("shouldn't send message with Shift+enter", () => {
    const sendEncryptedMessage = vi.fn();

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

  it('should send commands', () => {
    const sendEncryptedMessage = vi.fn();
    const showNotice = vi.fn();
    const clearActivities = vi.fn();

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
    fireEvent.change(textarea, { target: { value: '/me' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(sendEncryptedMessage).not.toHaveBeenCalled();

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
    fireEvent.change(textarea, {
      target: { value: '/nick 3po3ralotsofcrapscharactersforyourpleasureandnotmine' },
    });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(sendEncryptedMessage).toHaveBeenLastCalledWith({
      payload: { currentUsername: 'user', id: 'foo', newUsername: 'john-Th3Ripp-3r' },
      type: 'CHANGE_USERNAME',
    });

    // Test badcommand
    fireEvent.change(textarea, { target: { value: '/void' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
  });

  it('should work with touch support', () => {
    // Enable touch support
    dom.hasTouchSupport = true;

    vi.mock('@/utils/dom', () => {
      return {
        getSelectedText: vi.fn(),
        hasTouchSupport: true,
      };
    });

    const sendEncryptedMessage = vi.fn();

    const { getByTitle } = render(
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

    // Type test
    fireEvent.change(textarea, { target: { value: 'test' } });

    // Touch send button
    fireEvent.click(getByTitle('Send'));

    expect(sendEncryptedMessage).toHaveBeenLastCalledWith({
      payload: { text: 'test', timestamp: 1584183718135 },
      type: 'TEXT_MESSAGE',
    });

    // Should not send message
    fireEvent.click(getByTitle('Send'));

    expect(sendEncryptedMessage).toHaveBeenCalledTimes(1);
  });
});
