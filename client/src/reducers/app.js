import Cookie from 'js-cookie';
import { getTranslations } from 'i18n';

const language = Cookie.get('language') || navigator.language || 'en';

const initialState = {
  modalComponent: null,
  scrolledToBottom: true,
  windowIsFocused: true,
  unreadMessageCount: 0,
  soundIsEnabled: true,
  notificationIsEnabled: false,
  notificationIsAllowed: null,
  socketConnected: false,
  language,
  translations: getTranslations(language),
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        modalComponent: action.payload,
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modalComponent: null,
      };
    case 'SET_SCROLLED_TO_BOTTOM':
      return {
        ...state,
        scrolledToBottom: action.payload,
      };
    case 'TOGGLE_WINDOW_FOCUS':
      return {
        ...state,
        windowIsFocused: action.payload,
        unreadMessageCount: 0,
      };
    case 'RECEIVE_ENCRYPTED_MESSAGE_TEXT_MESSAGE':
      return {
        ...state,
        unreadMessageCount: state.windowIsFocused ? 0 : state.unreadMessageCount + 1,
      };
    case 'TOGGLE_SOUND_ENABLED':
      return {
        ...state,
        soundIsEnabled: action.payload,
      };
    case 'TOGGLE_NOTIFICATION_ENABLED':
      return {
        ...state,
        notificationIsEnabled: action.payload,
      };
    case 'TOGGLE_NOTIFICATION_ALLOWED':
      return {
        ...state,
        notificationIsAllowed: action.payload,
      };
    case 'TOGGLE_SOCKET_CONNECTED':
      return {
        ...state,
        socketConnected: action.payload,
      };
    case 'CHANGE_LANGUAGE':
      return {
        ...state,
        language: action.payload,
        translations: getTranslations(action.payload),
      };
    default:
      return state;
  }
};

export default app;
