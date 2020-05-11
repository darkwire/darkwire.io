import React from 'react';
import { render } from '@testing-library/react';
import Home from './Home';

jest.mock('react-modal'); // Cant load modal without root app element
jest.mock('components/T'); // Need store
jest.mock('components/Chat'); // Need store
jest.mock('utils/socket', () => { // Avoid exception
  return {
    connect: jest.fn().mockImplementation(()=>{
      return {
        on: jest.fn(),
        emit: jest.fn()
      }
    })
  }; 
}); //

jest.mock('utils/crypto', () => { // Need window.crytpo.subtle
  return jest.fn().mockImplementation(() => {
    return {
      createEncryptDecryptKeys: () => {
        return {
          privateKey: 'private',
          publicKey: 'public'
        }
      },
      exportKey: () => {
        return 'exportedkey'
      }
    }
  }); 
});

test('Home component is displaying', async () => {
  const { asFragment } = render(
    <Home
      translations={{}}
      members={[]}
      openModal={()=>{}}
      activities={[]}
      match={{params:{roomId: "roomTest"}}}
      createUser={()=>{}}
      toggleSocketConnected={()=>{}}
      receiveEncryptedMessage={()=>{}}
      receiveUnencryptedMessage={()=>{}}
      scrolledToBottom={true}
      setScrolledToBottom={()=>{}}
      iAmOwner={true}
      roomLocked={false}
      userId={'userId'}
      roomId={'testId'}
      sendEncryptedMessage={()=>{}}
      sendUnencryptedMessage={()=>{}}
      socketConnected={false}
      toggleSoundEnabled={()=>{}}
      soundIsEnabled={false}
      faviconCount={0}
      toggleWindowFocus={()=>{}}
      closeModal={()=>{}}
      publicKey={{}}
      username={'linus'}
    />
  );

  expect(asFragment()).toMatchSnapshot();
});
