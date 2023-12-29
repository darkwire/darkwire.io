import { describe, it, expect, vi } from 'vitest';

import reducer from './app';
import { getTranslations } from '@/i18n';

vi.mock('@/i18n', () => {
  return {
    getTranslations: vi.fn().mockReturnValue({ path: 'test' }),
  };
});

describe('App reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      language: 'en-US',
      modalComponent: null,
      scrolledToBottom: true,
      socketConnected: false,
      notificationIsEnabled: true,
      notificationIsAllowed: null,
      soundIsEnabled: true,
      persistenceIsEnabled: false,
      translations: { path: 'test' },
      unreadMessageCount: 0,
      windowIsFocused: true,
    });
  });

  it('should handle OPEN_MODAL', () => {
    expect(reducer({}, { type: 'OPEN_MODAL', payload: 'test' })).toEqual(
      expect.objectContaining({ modalComponent: 'test' }),
    );
  });

  it('should handle CLOSE_MODAL', () => {
    expect(reducer({}, { type: 'CLOSE_MODAL' })).toEqual(expect.objectContaining({ modalComponent: null }));
  });

  it('should handle SET_SCROLLED_TO_BOTTOM', () => {
    expect(reducer({}, { type: 'SET_SCROLLED_TO_BOTTOM', payload: true })).toEqual(
      expect.objectContaining({ scrolledToBottom: true }),
    );
    expect(reducer({}, { type: 'SET_SCROLLED_TO_BOTTOM', payload: false })).toEqual(
      expect.objectContaining({ scrolledToBottom: false }),
    );
  });

  it('should handle TOGGLE_WINDOW_FOCUS', () => {
    expect(reducer({ unreadMessageCount: 10 }, { type: 'TOGGLE_WINDOW_FOCUS', payload: true })).toEqual(
      expect.objectContaining({
        windowIsFocused: true,
        unreadMessageCount: 0,
      }),
    );
  });

  it('should handle RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE', () => {
    expect(
      reducer({ unreadMessageCount: 10, windowIsFocused: false }, { type: 'RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE' }),
    ).toEqual(expect.objectContaining({ unreadMessageCount: 11, windowIsFocused: false }));
    expect(
      reducer({ unreadMessageCount: 10, windowIsFocused: true }, { type: 'RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE' }),
    ).toEqual(expect.objectContaining({ unreadMessageCount: 0, windowIsFocused: true }));
  });

  it('should handle TOGGLE_SOUND_ENABLED', () => {
    expect(reducer({}, { type: 'TOGGLE_SOUND_ENABLED', payload: true })).toEqual(
      expect.objectContaining({
        soundIsEnabled: true,
      }),
    );
  });

  it('should handle TOGGLE_SOCKET_CONNECTED', () => {
    expect(reducer({}, { type: 'TOGGLE_SOCKET_CONNECTED', payload: true })).toEqual(
      expect.objectContaining({
        socketConnected: true,
      }),
    );
  });

  it('should handle CHANGE_LANGUAGE', () => {
    getTranslations.mockReturnValueOnce({ path: 'new lang' });
    expect(reducer({}, { type: 'CHANGE_LANGUAGE', payload: 'fr' })).toEqual(
      expect.objectContaining({
        language: 'fr',
        translations: { path: 'new lang' },
      }),
    );
  });
});
