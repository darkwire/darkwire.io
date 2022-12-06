import { getSocket } from '@/utils/socket';

const receiveUserEnter = (payload, dispatch) => {
  dispatch({ type: 'USER_ENTER', payload });
};

const receiveToggleLockRoom = (payload, dispatch, getState) => {
  const state = getState();

  const lockedByUser = state.room.members.find(m => m.publicKey.n === payload.publicKey.n);
  const lockedByUsername = lockedByUser.username;
  const lockedByUserId = lockedByUser.id;

  dispatch({
    type: 'RECEIVE_TOGGLE_LOCK_ROOM',
    payload: {
      username: lockedByUsername,
      locked: payload.locked,
      id: lockedByUserId,
    },
  });
};

const receiveUserExit = (payload, dispatch, getState) => {
  const state = getState();
  const payloadPublicKeys = payload.map(member => member.publicKey.n);
  const exitingUser = state.room.members.find(m => !payloadPublicKeys.includes(m.publicKey.n));

  if (!exitingUser) {
    return;
  }

  const exitingUserId = exitingUser.id;
  const exitingUsername = exitingUser.username;

  dispatch({
    type: 'USER_EXIT',
    payload: {
      members: payload,
      id: exitingUserId,
      username: exitingUsername,
    },
  });
};

export const receiveUnencryptedMessage = (type, payload) => async (dispatch, getState) => {
  switch (type) {
    case 'USER_ENTER':
      return receiveUserEnter(payload, dispatch);
    case 'USER_EXIT':
      return receiveUserExit(payload, dispatch, getState);
    case 'TOGGLE_LOCK_ROOM':
      return receiveToggleLockRoom(payload, dispatch, getState);
    default:
      return;
  }
};

const sendToggleLockRoom = (dispatch, getState) => {
  const state = getState();
  getSocket().emit('TOGGLE_LOCK_ROOM', null, res => {
    dispatch({
      type: 'TOGGLE_LOCK_ROOM',
      payload: {
        locked: res.isLocked,
        username: state.user.username,
        sender: state.user.id,
      },
    });
  });
};

export const sendUnencryptedMessage = type => async (dispatch, getState) => {
  switch (type) {
    case 'TOGGLE_LOCK_ROOM':
      return sendToggleLockRoom(dispatch, getState);
    default:
      return;
  }
};
