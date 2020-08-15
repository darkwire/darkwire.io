import React from 'react';
import { render } from '@testing-library/react';
import ConnectedHome from '.';
import { Provider } from 'react-redux';
import configureStore from 'store';
import { toggleWindowFocus, toggleNotificationEnabled, toggleSoundEnabled } from 'actions/app';
import { receiveEncryptedMessage } from 'actions/encrypted_messages';
import { notify, beep } from 'utils/notifications';
import Tinycon from 'tinycon';
import Modal from 'react-modal';

const store = configureStore();

jest.useFakeTimers();

// We don't test activity list here
jest.mock('./ActivityList', () => {
  return jest.fn().mockReturnValue(null);
});

jest.mock('react-modal'); // Cant load modal without root app element

jest.mock('utils/socket', () => {
  // Avoid exception
  return {
    connect: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        emit: jest.fn(),
      };
    }),
    getSocket: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        emit: jest.fn(),
      };
    }),
  };
});

jest.mock('shortid', () => {
  // Avoid exception
  return {
    generate: jest.fn().mockImplementation(() => {
      return 'shortidgenerated';
    }),
  };
});

jest.mock('utils/crypto', () => {
  // Need window.crytpo.subtle
  return jest.fn().mockImplementation(() => {
    return {
      createEncryptDecryptKeys: () => {
        return {
          privateKey: { n: 'private' },
          publicKey: { n: 'public' },
        };
      },
      exportKey: () => {
        return { n: 'exportedKey' };
      },
    };
  });
});

jest.mock('utils/message', () => {
  return {
    process: jest.fn(async (payload, state) => ({
      ...payload,
      payload: { payload: 'text', username: 'sender', text: 'new message' },
    })),
  };
});

jest.mock('utils/notifications', () => {
  return {
    notify: jest.fn(),
    beep: { play: jest.fn() },
  };
});

jest.mock('tinycon', () => {
  return {
    setBubble: jest.fn(),
  };
});

describe('Connected Home component', () => {
  beforeEach(() => {
    global.Notification = {
      permission: 'granted',
    };
  });

  afterEach(() => {
    delete global.Notification;
  });

  it('should display', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <ConnectedHome match={{ params: { roomId: 'roomTest' } }} userId="testUserId" />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should set notification', () => {
    render(
      <Provider store={store}>
        <ConnectedHome match={{ params: { roomId: 'roomTest' } }} userId="testUserId" />
      </Provider>,
    );

    expect(store.getState().app.notificationIsAllowed).toBe(true);
    expect(store.getState().app.notificationIsEnabled).toBe(true);

    global.Notification = {
      permission: 'denied',
    };

    render(
      <Provider store={store}>
        <ConnectedHome match={{ params: { roomId: 'roomTest' } }} userId="testUserId" />
      </Provider>,
    );

    expect(store.getState().app.notificationIsAllowed).toBe(false);

    global.Notification = {
      permission: 'default',
    };

    render(
      <Provider store={store}>
        <ConnectedHome match={{ params: { roomId: 'roomTest' } }} userId="testUserId" />
      </Provider>,
    );

    expect(store.getState().app.notificationIsAllowed).toBe(null);
  });

  it('should send notifications', async () => {
    Modal.prototype.getSnapshotBeforeUpdate = jest.fn().mockReturnValue(null);
    const { rerender } = render(
      <Provider store={store}>
        <ConnectedHome match={{ params: { roomId: 'roomTest' } }} userId="testUserId" roomId={'testId'} />
      </Provider>,
    );

    // Test with window focused
    await receiveEncryptedMessage({
      type: 'TEXT_MESSAGE',
      payload: {},
    })(store.dispatch, store.getState);

    rerender(
      <Provider store={store}>
        <ConnectedHome match={{ params: { roomId: 'roomTest' } }} userId="testUserId" roomId={'testId'} />
      </Provider>,
    );

    expect(store.getState().app.unreadMessageCount).toBe(0);
    expect(notify).not.toHaveBeenCalled();
    expect(beep.play).not.toHaveBeenCalled();
    expect(Tinycon.setBubble).not.toHaveBeenCalled();

    // Test with window unfocused
    await toggleWindowFocus(false)(store.dispatch);
    await receiveEncryptedMessage({
      type: 'TEXT_MESSAGE',
      payload: {},
    })(store.dispatch, store.getState);

    rerender(
      <Provider store={store}>
        <ConnectedHome match={{ params: { roomId: 'roomTest' } }} userId="testUserId" roomId={'testId'} />
      </Provider>,
    );
    expect(store.getState().app.unreadMessageCount).toBe(1);
    expect(notify).toHaveBeenLastCalledWith('sender said:', 'new message');
    expect(beep.play).toHaveBeenLastCalledWith();
    expect(Tinycon.setBubble).toHaveBeenLastCalledWith(1);

    // Test with sound and notification disabled
    await toggleNotificationEnabled(false)(store.dispatch);
    await toggleSoundEnabled(false)(store.dispatch);
    await receiveEncryptedMessage({
      type: 'TEXT_MESSAGE',
      payload: {},
    })(store.dispatch, store.getState);

    rerender(
      <Provider store={store}>
        <ConnectedHome match={{ params: { roomId: 'roomTest' } }} userId="testUserId" roomId={'testId'} />
      </Provider>,
    );

    expect(store.getState().app.unreadMessageCount).toBe(2);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(beep.play).toHaveBeenCalledTimes(1);
    expect(Tinycon.setBubble).toHaveBeenLastCalledWith(2);
  });
});
