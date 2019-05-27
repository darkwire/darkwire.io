import {
  process as processMessage,
} from 'utils/message'

export const openModal = payload => ({ type: 'OPEN_MODAL', payload })
export const closeModal = () => ({ type: 'CLOSE_MODAL' })

export const setScrolledToBottom = payload => ({ type: 'SET_SCROLLED_TO_BOTTOM', payload })

export const showNotice = payload => async (dispatch) => {
  dispatch({ type: 'SHOW_NOTICE', payload })
}

export const toggleWindowFocus = payload => async (dispatch) => {
  dispatch({ type: 'TOGGLE_WINDOW_FOCUS', payload })
}

export const toggleSoundEnabled = payload => async (dispatch) => {
  dispatch({ type: 'TOGGLE_SOUND_ENABLED', payload })
}

export const toggleSocketConnected = payload => async (dispatch) => {
  dispatch({ type: 'TOGGLE_SOCKET_CONNECTED', payload })
}

export const receiveEncryptedMessage = payload => async (dispatch, getState) => {
  const state = getState()
  const message = await processMessage(payload, state)
  // Pass current state to all RECEIVE_ENCRYPTED_MESSAGE reducers for convenience, since each may have different needs
  dispatch({ type: `RECEIVE_ENCRYPTED_MESSAGE_${message.type}`, payload: { payload: message.payload, state } })
}

export const createUser = payload => async (dispatch) => {
  dispatch({ type: 'CREATE_USER', payload })
}

export const clearActivities = () => async (dispatch) => {
  dispatch({ type: 'CLEAR_ACTIVITIES' })
}
