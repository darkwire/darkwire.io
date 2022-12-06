import * as actions from './app';

import { describe, it, expect, vi } from 'vitest';

describe('App actions', () => {
  it('should create an action to scroll to bottom', () => {
    expect(actions.setScrolledToBottom('test')).toEqual({
      type: 'SET_SCROLLED_TO_BOTTOM',
      payload: 'test',
    });
  });

  it('should create an action to close modal', () => {
    expect(actions.closeModal()).toEqual({
      type: 'CLOSE_MODAL',
    });
  });

  it('should create an action to open modal', () => {
    expect(actions.openModal('test')).toEqual({
      type: 'OPEN_MODAL',
      payload: 'test',
    });
  });

  it('should create an action to clear activities', () => {
    const mockDispatch = vi.fn();

    actions.clearActivities()(mockDispatch);

    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'CLEAR_ACTIVITIES',
    });
  });
  it('should create all actions', () => {
    const mockDispatch = vi.fn();

    const actionsResults = [
      [actions.toggleWindowFocus('test'), 'TOGGLE_WINDOW_FOCUS'],
      [actions.showNotice('test'), 'SHOW_NOTICE'],
      [actions.toggleSoundEnabled('test'), 'TOGGLE_SOUND_ENABLED'],
      [actions.toggleSocketConnected('test'), 'TOGGLE_SOCKET_CONNECTED'],
      [actions.createUser('test'), 'CREATE_USER'],
      [actions.setLanguage('test'), 'CHANGE_LANGUAGE'],
    ];

    actionsResults.forEach(([action, type]) => {
      action(mockDispatch);
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type,
        payload: 'test',
      });
    });
  });
});
