import { describe, it, expect, vi } from 'vitest';

import reducer, { createUser, changeUsername} from './user';

vi.mock('@/i18n', () => {
  return {
    getTranslations: vi.fn().mockReturnValue({ path: 'test' }),
  };
});

describe('User reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({ id: '', privateKey: {}, publicKey: {}, username: '' });
  });

  it('should handle CREATE_USER', () => {
    const payload = { publicKey: { n: 'alicekey' }, username: 'alice' };
    
    expect(reducer({},createUser(payload) )).toEqual({
      id: 'alicekey',
      publicKey: { n: 'alicekey' },
      username: 'alice',
    });
  });

  it('should handle SEND_ENCRYPTED_MESSAGE_CHANGE_USERNAME', () => {
    const payload = { newUsername: 'alice' };
    
    expect(reducer({ username: 'polux' }, changeUsername(payload))).toEqual({
      username: 'alice',
    });
  });
});
