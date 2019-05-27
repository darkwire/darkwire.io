import { getSocket } from 'utils/socket'
import {
  prepare as prepareMessage,
} from 'utils/message'

export const sendEncryptedMessage = payload => async (dispatch, getState) => {
  const state = getState()
  const msg = await prepareMessage(payload, state)
  dispatch({ type: `SEND_ENCRYPTED_MESSAGE_${msg.original.type}`, payload: msg.original.payload })
  getSocket().emit('ENCRYPTED_MESSAGE', msg.toSend)
}