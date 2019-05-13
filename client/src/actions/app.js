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
