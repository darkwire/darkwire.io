import React from 'react';
import { render } from '@testing-library/react';
import Home from './Home';
import { Provider } from 'react-redux';
import configureStore from 'store';

const store = configureStore();

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
  };
}); //

jest.mock('utils/crypto', () => {
  // Need window.crytpo.subtle
  return jest.fn().mockImplementation(() => {
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
  });
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
