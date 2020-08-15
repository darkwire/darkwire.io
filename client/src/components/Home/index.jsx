import { connect } from 'react-redux';
import { useLoaderData } from 'react-router-dom';

import {
  receiveEncryptedMessage,
  createUser,
  openModal,
  closeModal,
  toggleWindowFocus,
  toggleSoundEnabled,
  togglePersistenceEnabled,
  toggleNotificationEnabled,
  toggleNotificationAllowed,
  toggleSocketConnected,
  receiveUnencryptedMessage,
  sendUnencryptedMessage,
  sendEncryptedMessage,
  setLanguage,
} from '@/actions';

import Home from './Home';
import WithNewMessageNotification from './WithNewMessageNotification';

const mapStateToProps = state => {
  const me = state.room.members.find(m => m.id === state.user.id);

  return {
    activities: state.activities.items,
    userId: state.user.id,
    username: state.user.username,
    publicKey: state.user.publicKey,
    privateKey: state.user.privateKey,
    members: state.room.members.filter(m => m.username && m.publicKey),
    roomId: state.room.id,
    roomLocked: state.room.isLocked,
    modalComponent: state.app.modalComponent,
    iAmOwner: Boolean(me && me.isOwner),
    faviconCount: state.app.unreadMessageCount,
    soundIsEnabled: state.app.soundIsEnabled,
    persistenceIsEnabled: state.app.persistenceIsEnabled,
    notificationIsEnabled: state.app.notificationIsEnabled,
    notificationIsAllowed: state.app.notificationIsAllowed,
    socketConnected: state.app.socketConnected,
    language: state.app.language,
    translations: state.app.translations,
  };
};

const mapDispatchToProps = {
  receiveEncryptedMessage,
  createUser,
  openModal,
  closeModal,
  toggleWindowFocus,
  toggleSoundEnabled,
  togglePersistenceEnabled,
  toggleNotificationEnabled,
  toggleNotificationAllowed,
  toggleSocketConnected,
  receiveUnencryptedMessage,
  sendUnencryptedMessage,
  sendEncryptedMessage,
  setLanguage,
};

export const ConnectedHome = WithNewMessageNotification(connect(mapStateToProps, mapDispatchToProps)(Home));

const HomeWithParams = ({ ...props }) => {
  const socketId = useLoaderData();
  return <ConnectedHome socketId={socketId} {...props} />;
};

export default HomeWithParams;
