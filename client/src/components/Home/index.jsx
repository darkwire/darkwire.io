import { connect } from 'react-redux';
import { useLoaderData } from 'react-router-dom';

import {
  receiveEncryptedMessage,
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

export const ConnectedHome = connect(mapStateToProps, mapDispatchToProps)(Home);

export const ConnectedHomeWithNotification = ({ socketId, ...props }) => {
  return (
    <WithNewMessageNotification>
      <ConnectedHome socketId={socketId} {...props} />
    </WithNewMessageNotification>
  );
};

const HomeWithParams = ({ ...props }) => {
  const socketId = useLoaderData();
  return <ConnectedHomeWithNotification socketId={socketId} {...props} />;
};

export default HomeWithParams;
