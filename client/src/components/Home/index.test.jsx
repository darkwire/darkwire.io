import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import Tinycon from 'tinycon';
import Modal from 'react-modal';
import { expect, vi, describe, beforeEach, afterEach, it } from 'vitest';

import configureStore from '@/store';
import { toggleWindowFocus, toggleNotificationEnabled, toggleSoundEnabled } from '@/actions/app';
import { receiveEncryptedMessage } from '@/actions/encrypted_messages';
import { notify, beep } from '@/utils/notifications';
import { act } from 'react-dom/test-utils';

import { ConnectedHomeWithNotification } from './';

const store = configureStore();

vi.useFakeTimers();

vi.mock('react-modal'); // Cant load modal without root app element

vi.mock('nanoid', () => {
  // Avoid exception
  return {
    nanoid: vi.fn().mockImplementation(() => {
      return 'shortidgenerated';
    }),
  };
});

vi.mock('tinycon', () => {
  return {
    default: { setBubble: vi.fn() },
  };
});

// We don't test activity list here
vi.mock('./ActivityList', () => {
  return { default: vi.fn().mockReturnValue(null) };
});

vi.mock('@/utils/socket', () => {
  // Avoid exception
  return {
    connect: vi.fn().mockImplementation(() => {
      return {
        on: vi.fn(),
        emit: vi.fn(),
        close: vi.fn(),
      };
    }),
    getSocket: vi.fn().mockImplementation(() => {
      return {
        on: vi.fn(),
        emit: vi.fn(),
        close: vi.fn(),
      };
    }),
  };
});

vi.mock('@/utils/crypto', () => {
  // Need window.crytpo.subtle
  return {
    default: vi.fn().mockImplementation(() => {
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
    }),
  };
});

vi.mock('@/utils/message', () => {
  return {
    process: vi.fn(async (payload, state) => ({
      ...payload,
      payload: { payload: 'text', username: 'sender', text: 'new message' },
    })),
  };
});

vi.mock('@/utils/notifications', () => {
  return {
    notify: vi.fn(),
    beep: { play: vi.fn() },
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

  it('should display', async () => {
    const { asFragment, findByText } = render(
      <Provider store={store}>
        <ConnectedHomeWithNotification userId="testUserId" socketId="roomTest" />
      </Provider>,
    );

    await findByText('Disconnected');

    expect(asFragment()).toMatchSnapshot();
  });

  it('should detect notification granted', async () => {
    const { findByText } = render(
      <Provider store={store}>
        <ConnectedHomeWithNotification userId="testUserId" socketId="roomTest" />
      </Provider>,
    );

    await findByText('Disconnected');

    expect(store.getState().app.notificationIsAllowed).toBe(true);
    expect(store.getState().app.notificationIsEnabled).toBe(true);
  });

  it('should detect notification denied', async () => {
    global.Notification = {
      permission: 'denied',
    };

    const { findByText } = render(
      <Provider store={store}>
        <ConnectedHomeWithNotification userId="testUserId" socketId="roomTest" />
      </Provider>,
    );

    await findByText('Disconnected');

    expect(store.getState().app.notificationIsAllowed).toBe(false);
  });

  it('should detect notification default', async () => {
    global.Notification = {
      permission: 'default',
    };

    const { findByText } = render(
      <Provider store={store}>
        <ConnectedHomeWithNotification userId="testUserId" socketId="roomTest" />
      </Provider>,
    );

    await findByText('Disconnected');

    expect(store.getState().app.notificationIsAllowed).toBe(null);
  });

  it('should send notifications', async () => {
    Modal.prototype.getSnapshotBeforeUpdate = vi.fn().mockReturnValue(null);

    const { rerender, findByText } = render(
      <Provider store={store}>
        <ConnectedHomeWithNotification userId="testUserId" socketId="roomTest" />
      </Provider>,
    );

    await findByText('Disconnected');

    // Test with window focused
    await act(() =>
      receiveEncryptedMessage({
        type: 'TEXT_MESSAGE',
        payload: {},
      })(store.dispatch, store.getState),
    );

    rerender(
      <Provider store={store}>
        <ConnectedHomeWithNotification userId="testUserId" socketId="roomTest" />
      </Provider>,
    );

    expect(store.getState().app.unreadMessageCount).toBe(0);
    expect(notify).not.toHaveBeenCalled();
    expect(beep.play).not.toHaveBeenCalled();
    expect(Tinycon.setBubble).not.toHaveBeenCalled();

    // Test with window unfocused
    await act(() => toggleWindowFocus(false)(store.dispatch));
    await act(() =>
      receiveEncryptedMessage({
        type: 'TEXT_MESSAGE',
        payload: {},
      })(store.dispatch, store.getState),
    );

    rerender(
      <Provider store={store}>
        <ConnectedHomeWithNotification userId="testUserId" socketId="roomTest" />
      </Provider>,
    );
    expect(store.getState().app.unreadMessageCount).toBe(1);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenLastCalledWith('sender said:', 'new message');
    expect(beep.play).toHaveBeenCalledTimes(1);
    expect(beep.play).toHaveBeenLastCalledWith();
    expect(Tinycon.setBubble).toHaveBeenLastCalledWith(1);

    notify.mockClear();
    beep.play.mockClear();

    // Test with sound and notification disabled
    await act(() => toggleNotificationEnabled(false)(store.dispatch));
    await act(() => toggleSoundEnabled(false)(store.dispatch));
    await act(() =>
      receiveEncryptedMessage({
        type: 'TEXT_MESSAGE',
        payload: {},
      })(store.dispatch, store.getState),
    );

    rerender(
      <Provider store={store}>
        <ConnectedHomeWithNotification userId="testUserId" socketId="roomTest" />
      </Provider>,
    );

    expect(store.getState().app.unreadMessageCount).toBe(2);
    expect(notify).toHaveBeenCalledTimes(0);
    expect(beep.play).toHaveBeenCalledTimes(0);
    expect(Tinycon.setBubble).toHaveBeenLastCalledWith(2);
  });
});
