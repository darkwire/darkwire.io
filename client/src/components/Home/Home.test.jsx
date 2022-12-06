import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { test, expect, vi } from 'vitest';

import Home from './Home';
import configureStore from '@/store';

const store = configureStore();

vi.mock('react-modal'); // Cant load modal without root app element

vi.mock('@/RoomLink');
vi.mock('@/components/Nav');

vi.mock('@/utils/socket', () => {
  // Avoid exception
  return {
    connect: vi.fn().mockImplementation(() => {
      return {
        on: vi.fn(),
        emit: vi.fn(),
      };
    }),
  };
}); //

vi.mock('../../utils/crypto', () => {
  // Need window.crytpo.subtle
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        createEncryptDecryptKeys: () => {
          return {
            privateKey: 'private',
            publicKey: 'public',
          };
        },
        exportKey: () => {
          return 'exportedkey';
        },
      };
    }),
  };
});

test('Home component is displaying', async () => {
  const { asFragment } = render(
    <Provider store={store}>
      <Home
        translations={{}}
        members={[]}
        openModal={() => {}}
        activities={[]}
        match={{ params: { roomId: 'roomTest' } }}
        createUser={() => {}}
        toggleSocketConnected={() => {}}
        receiveEncryptedMessage={() => {}}
        receiveUnencryptedMessage={() => {}}
        scrolledToBottom={true}
        setScrolledToBottom={() => {}}
        iAmOwner={true}
        roomLocked={false}
        userId={'userId'}
        roomId={'testId'}
        sendEncryptedMessage={() => {}}
        sendUnencryptedMessage={() => {}}
        socketConnected={false}
        toggleSoundEnabled={() => {}}
        soundIsEnabled={false}
        toggleNotificationEnabled={() => {}}
        toggleNotificationAllowed={() => {}}
        notificationIsEnabled={false}
        faviconCount={0}
        toggleWindowFocus={() => {}}
        closeModal={() => {}}
        publicKey={{}}
        username={'linus'}
      />
    </Provider>,
  );

  expect(asFragment()).toMatchSnapshot();
});
