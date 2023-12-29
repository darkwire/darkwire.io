import { getSocket } from '@/utils/socket';
import { prepare as prepareMessage, process as processMessage } from '@/utils/message';

export const sendEncryptedMessage = payload => async (dispatch, getState) => {
  const state = getState();
  const msg = await prepareMessage(payload, state);
  dispatch({ type: `SEND_ENCRYPTED_MESSAGE_${msg.original.type}`, payload: msg.original.payload });
  getSocket().emit('ENCRYPTED_MESSAGE', msg.toSend);
};

export const receiveEncryptedMessage = payload => async (dispatch, getState) => {
  const state = getState();
  const message = await processMessage(payload, state);
  // Pass current state to all RECEIVE_ENCRYPTED_MESSAGE reducers for convenience, since each may have different needs
  dispatch({ type: `RECEIVE_ENCRYPTED_MESSAGE_${message.type}`, payload: { payload: message.payload, state } });
};
