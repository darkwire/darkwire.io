import isEqual from 'lodash/isEqual'
import {
  process as processMessage,
  prepare as prepareMessage,
} from 'utils/message'
import { getSocket } from 'utils/socket'

export const receiveEncryptedMessage = payload => async (dispatch, getState) => {
  const state = getState()
  const message = await processMessage(payload, state)
  // Pass current state to all RECEIVE_ENCRYPTED_MESSAGE reducers for convenience, since each may have different needs
  dispatch({ type: `RECEIVE_ENCRYPTED_MESSAGE_${message.type}`, payload: { payload: message.payload, state } })
}

export const createUser = payload => async (dispatch) => {
  dispatch({ type: 'CREATE_USER', payload })
}

export const sendUserEnter = payload => async () => {
  getSocket().emit('USER_ENTER', {
    publicKey: payload.publicKey,
  })
}

export const receiveUserExit = payload => async (dispatch, getState) => {
  const state = getState()
  const exitingUser = state.room.members.find(m => !payload.map(p => JSON.stringify(p.publicKey)).includes(JSON.stringify(m.publicKey)))

  if (!exitingUser) {
    return;
  }

  const exitingUserId = exitingUser.id
  const exitingUsername = exitingUser.username

  dispatch({
    type: 'USER_EXIT',
    payload: {
      members: payload,
      id: exitingUserId,
      username: exitingUsername,
    },
  })
}

export const receiveUserEnter = payload => async (dispatch) => {
  dispatch({ type: 'USER_ENTER', payload })
}

export const onFileTransfer = payload => async (dispatch) => {
  dispatch({ type: 'PREFLIGHT_FILE_TRANSFER', payload })
}

export const sendEncryptedMessage = payload => async (dispatch, getState) => {
  const state = getState()
  const msg = await prepareMessage(payload, state)
  dispatch({ type: `SEND_ENCRYPTED_MESSAGE_${msg.original.type}`, payload: msg.original.payload })
  getSocket().emit('ENCRYPTED_MESSAGE', msg.toSend)
}

export const toggleLockRoom = () => async (dispatch, getState) => {
  const state = getState()
  getSocket().emit('TOGGLE_LOCK_ROOM', null, (res) => {
    dispatch({
      type: 'TOGGLE_LOCK_ROOM',
      payload: {
        locked: res.isLocked,
        username: state.user.username,
        sender: state.user.id,
      },
    })
  })
}

export const receiveToggleLockRoom = payload => async (dispatch, getState) => {
  const state = getState()

  const lockedByUser = state.room.members.find(m => isEqual(m.publicKey, payload.publicKey))
  const lockedByUsername = lockedByUser.username
  const lockedByUserId = lockedByUser.id

  dispatch({
    type: 'RECEIVE_TOGGLE_LOCK_ROOM',
    payload: {
      username: lockedByUsername,
      locked: payload.locked,
      id: lockedByUserId,
    },
  })
}

export const clearActivities = () => async (dispatch) => {
  dispatch({ type: 'CLEAR_ACTIVITIES' })
}

export const sendUserDisconnect = () => async () => {
  getSocket().emit('USER_DISCONNECT')
}

