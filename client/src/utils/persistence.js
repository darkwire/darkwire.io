/**
 * Handle localStorage persistence
 */

import { debounce } from 'lodash';
import { getTranslations } from '@/i18n';

const getSettings = () => {
  try {
    return JSON.parse(localStorage.getItem('settings')) || {};
  } catch (e) {
    return {};
  }
};

const setSettings = settings => {
  localStorage.setItem('settings', JSON.stringify(settings));
};

export const loadPersistedState = () => {
  const state = {};

  const stored = getSettings();

  if (stored.persistenceIsEnabled !== true) {
    return;
  }

  state.app = {};
  if (stored.language) {
    state.app.language = stored.language;
    state.app.translations = getTranslations(stored.language);
  }
  state.user = {};
  if (stored.username) {
    state.user.username = stored.username;
  }
  state.app.soundIsEnabled = stored.soundIsEnabled !== false;
  state.app.persistenceIsEnabled = stored.persistenceIsEnabled === true;
  state.app.notificationIsEnabled = stored.notificationIsEnabled !== false;
  return state;
};

let prevState;

export const persistState = debounce(async store => {
  const state = store.getState();

  // We need prev state to compare
  if (prevState) {
    const {
      user: { username },
      app: { notificationIsEnabled, soundIsEnabled, persistenceIsEnabled, language },
    } = state;


    if (!persistenceIsEnabled) {
      setSettings({ persistenceIsEnabled: false });
      return;
    }

    const stored = getSettings();

    if (prevState.user.notificationIsEnabled !== notificationIsEnabled) {
      stored.notificationIsEnabled = notificationIsEnabled;
    }
    if (prevState.app.soundIsEnabled !== soundIsEnabled) {
      stored.soundIsEnabled = soundIsEnabled;
    }
    if (prevState.app.persistenceIsEnabled !== persistenceIsEnabled) {
      stored.persistenceIsEnabled = persistenceIsEnabled;
    }
    if (prevState.user.username !== username && username) {
      stored.username = username;
    }
    if (prevState.app.language !== language && language) {
      stored.language = language;
    }

    setSettings(stored);
  }
  prevState = JSON.parse(JSON.stringify(state));
}, 1000);
