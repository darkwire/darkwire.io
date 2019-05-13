import fetch from 'api'
import isEqual from 'lodash/isEqual'
import {
  process as processMessage,
  prepare as prepareMessage,
} from 'utils/message'
import { getIO } from 'utils/socket'

export const createRoom = id => async dispatch => fetch({
  resourceName: 'handshake',
  method: 'POST',
  body: {
    roomId: id,
  },
}, dispatch, 'handshake')

export const receiveSocketMessage = payload => async (dispatch, getState) => {
  const state = getState()
  const message = await processMessage(payload, state)
  // Pass current state to all HANDLE_SOCKET_MESSAGE reducers for convenience, since each may have different needs
  dispatch({ type: `HANDLE_SOCKET_MESSAGE_${message.type}`, payload: { payload: message.payload, state } })
}

export const createUser = payload => async (dispatch) => {
  dispatch({ type: 'CREATE_USER', payload })
}

export const sendUserEnter = payload => async () => {
  getIO().emit('USER_ENTER', {
    publicKey: payload.publicKey,
  })
}

export const receiveUserExit = payload => async (dispatch, getState) => {
  const state = getState()
  const exitingUser = state.room.members.find(m => !payload.map(p => JSON.stringify(p.publicKey)).includes(JSON.stringify(m.publicKey)))
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

export const sendSocketMessage = payload => async (dispatch, getState) => {
  const state = getState()
  const msg = await prepareMessage(payload, state)
  dispatch({ type: `SEND_SOCKET_MESSAGE_${msg.original.type}`, payload: msg.original.payload })
  getIO().emit('PAYLOAD', msg.toSend)
}

export const toggleLockRoom = () => async (dispatch, getState) => {
  const state = getState()
  getIO().emit('TOGGLE_LOCK_ROOM', null, (res) => {
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
