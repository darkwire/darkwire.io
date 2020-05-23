import * as actions from './unencrypted_messages';
import { getSocket } from 'utils/socket';

const mockEmit = jest.fn((_type, _null, callback) => {
  callback({ isLocked: true });
});

jest.mock('utils/socket', () => {
  return {
    getSocket: jest.fn().mockImplementation(() => ({
      emit: mockEmit,
    })),
  };
});

describe('Reveice unencrypted message actions', () => {
  it('should create no action', () => {
    const mockDispatch = jest.fn();
    actions.receiveUnencryptedMessage('FAKE')(mockDispatch, jest.fn().mockReturnValue({}));
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should create user enter action', () => {
    const mockDispatch = jest.fn();
    actions.receiveUnencryptedMessage('USER_ENTER', 'test')(mockDispatch, jest.fn().mockReturnValue({ state: {} }));
    expect(mockDispatch).toHaveBeenLastCalledWith({ type: 'USER_ENTER', payload: 'test' });
  });

  it('should create user exit action', () => {
    const mockDispatch = jest.fn();
    const state = {
      room: {
        members: [
          { publicKey: { n: 'alankey' }, id: 'alankey', username: 'alan' },
          { publicKey: { n: 'dankey' }, id: 'dankey', username: 'dan' },
          { publicKey: { n: 'alicekey' }, id: 'alicekey', username: 'dan' },
        ],
      },
    };
    const mockGetState = jest.fn().mockReturnValue(state);
    const payload1 = [
      { publicKey: { n: 'alankey' } },
      { publicKey: { n: 'dankey' } },
      { publicKey: { n: 'alicekey' } },
    ];
    const payload2 = [{ publicKey: { n: 'dankey' } }, { publicKey: { n: 'alicekey' } }];

    // Nobody left
    actions.receiveUnencryptedMessage('USER_EXIT', payload1)(mockDispatch, mockGetState);

    expect(mockDispatch).not.toHaveBeenCalled();

    actions.receiveUnencryptedMessage('USER_EXIT', payload2)(mockDispatch, mockGetState);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      payload: {
        id: 'alankey',
        members: [{ publicKey: { n: 'dankey' } }, { publicKey: { n: 'alicekey' } }],
        username: 'alan',
      },
      type: 'USER_EXIT',
    });
  });

  it('should create receive toggle lock room action', () => {
    const mockDispatch = jest.fn();
    const state = {
      room: {
        members: [
          { publicKey: { n: 'alankey' }, id: 'idalan', username: 'alan' },
          { publicKey: { n: 'dankey' }, id: 'iddan', username: 'dan' },
        ],
      },
    };
    const mockGetState = jest.fn().mockReturnValue(state);
    const payload = { publicKey: { n: 'alankey' } };

    actions.receiveUnencryptedMessage('TOGGLE_LOCK_ROOM', payload)(mockDispatch, mockGetState);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      payload: { id: 'idalan', locked: undefined, username: 'alan' },
      type: 'RECEIVE_TOGGLE_LOCK_ROOM',
    });
  });

  it('should create receive toggle lock room action', () => {
    const mockDispatch = jest.fn();
    const state = {
      user: {
        username: 'alan',
        id: 'idalan',
      },
    };
    const mockGetState = jest.fn().mockReturnValue(state);

    actions.sendUnencryptedMessage('TOGGLE_LOCK_ROOM')(mockDispatch, mockGetState);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      payload: { locked: true, sender: 'idalan', username: 'alan' },
      type: 'TOGGLE_LOCK_ROOM',
    });
  });
});

describe('Send unencrypted message actions', () => {
  it('should create no action', () => {
    const mockDispatch = jest.fn();
    actions.sendUnencryptedMessage('FAKE')(mockDispatch, jest.fn().mockReturnValue({}));
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should create toggle lock room action', () => {
    const mockDispatch = jest.fn();
    const state = {
      user: {
        username: 'alan',
        id: 'idalan',
      },
    };
    const mockGetState = jest.fn().mockReturnValue(state);

    actions.sendUnencryptedMessage('TOGGLE_LOCK_ROOM')(mockDispatch, mockGetState);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      payload: { locked: true, sender: 'idalan', username: 'alan' },
      type: 'TOGGLE_LOCK_ROOM',
    });
  });
});
