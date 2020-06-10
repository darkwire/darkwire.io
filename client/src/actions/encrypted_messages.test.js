import * as actions from './encrypted_messages';
import { getSocket } from 'utils/socket';
import { prepare as prepareMessage, process as processMessage } from 'utils/message';

jest.mock('utils/message', () => {
  return {
    prepare: jest
      .fn()
      .mockResolvedValue({ original: { type: 'messageType', payload: 'test' }, toSend: 'encryptedpayload' }),
    process: jest.fn().mockResolvedValue({ type: 'messageType', payload: 'test' }),
  };
});

const mockEmit = jest.fn();

jest.mock('utils/socket', () => {
  return {
    getSocket: jest.fn().mockImplementation(() => ({
      emit: mockEmit,
    })),
  };
});

describe('Encrypted messages actions', () => {
  it('should create an action to send message', async () => {
    const mockDispatch = jest.fn();

    await actions.sendEncryptedMessage({ payload: 'payload' })(mockDispatch, jest.fn().mockReturnValue({ state: {} }));

    expect(prepareMessage).toHaveBeenLastCalledWith({ payload: 'payload' }, { state: {} });
    expect(mockDispatch).toHaveBeenLastCalledWith({ payload: 'test', type: 'SEND_ENCRYPTED_MESSAGE_messageType' });
    expect(getSocket().emit).toHaveBeenLastCalledWith('ENCRYPTED_MESSAGE', 'encryptedpayload');
  });

  it('should create an action to receive message', async () => {
    const mockDispatch = jest.fn();

    await actions.receiveEncryptedMessage({ payload: 'encrypted' })(
      mockDispatch,
      jest.fn().mockReturnValue({ state: {} }),
    );

    expect(processMessage).toHaveBeenLastCalledWith({ payload: 'encrypted' }, { state: {} });
    expect(mockDispatch).toHaveBeenLastCalledWith({
      payload: { payload: 'test', state: { state: {} } },
      type: 'RECEIVE_ENCRYPTED_MESSAGE_messageType',
    });
  });
});
