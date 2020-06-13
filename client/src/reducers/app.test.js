import reducer from './app';
import { getTranslations } from 'i18n';

jest.mock('i18n', () => {
  return {
    getTranslations: jest.fn().mockReturnValue({ path: 'test' }),
  };
});

describe('App reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      language: 'en-US',
      modalComponent: null,
      scrolledToBottom: true,
      socketConnected: false,
      notificationIsEnabled: false,
      notificationIsAllowed: null,
      soundIsEnabled: true,
      translations: { path: 'test' },
      unreadMessageCount: 0,
      windowIsFocused: true,
    });
  });

  it('should handle OPEN_MODAL', () => {
    expect(reducer({}, { type: 'OPEN_MODAL', payload: 'test' })).toEqual({ modalComponent: 'test' });
  });

  it('should handle CLOSE_MODAL', () => {
    expect(reducer({}, { type: 'CLOSE_MODAL' })).toEqual({ modalComponent: null });
  });

  it('should handle SET_SCROLLED_TO_BOTTOM', () => {
    expect(reducer({}, { type: 'SET_SCROLLED_TO_BOTTOM', payload: true })).toEqual({ scrolledToBottom: true });
    expect(reducer({}, { type: 'SET_SCROLLED_TO_BOTTOM', payload: false })).toEqual({ scrolledToBottom: false });
  });

  it('should handle TOGGLE_WINDOW_FOCUS', () => {
    expect(reducer({ unreadMessageCount: 10 }, { type: 'TOGGLE_WINDOW_FOCUS', payload: true })).toEqual({
      windowIsFocused: true,
      unreadMessageCount: 0,
    });
  });

  it('should handle RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE', () => {
    expect(
      reducer({ unreadMessageCount: 10, windowIsFocused: false }, { type: 'RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE' }),
    ).toEqual({ unreadMessageCount: 11, windowIsFocused: false });
    expect(
      reducer({ unreadMessageCount: 10, windowIsFocused: true }, { type: 'RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE' }),
    ).toEqual({ unreadMessageCount: 0, windowIsFocused: true });
  });

  it('should handle TOGGLE_SOUND_ENABLED', () => {
    expect(reducer({}, { type: 'TOGGLE_SOUND_ENABLED', payload: true })).toEqual({
      soundIsEnabled: true,
    });
  });

  it('should handle TOGGLE_SOCKET_CONNECTED', () => {
    expect(reducer({}, { type: 'TOGGLE_SOCKET_CONNECTED', payload: true })).toEqual({
      socketConnected: true,
    });
  });

  it('should handle CHANGE_LANGUAGE', () => {
    getTranslations.mockReturnValueOnce({ path: 'new lang' });
    expect(reducer({}, { type: 'CHANGE_LANGUAGE', payload: 'fr' })).toEqual({
      language: 'fr',
      translations: { path: 'new lang' },
    });
  });
});
