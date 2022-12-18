import React from 'react';
import ReactModal from 'react-modal';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { X, AlertCircle } from 'react-feather';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { createUser } from '@/reducers/user';

import Crypto from '@/utils/crypto';
import { connect as connectSocket } from '@/utils/socket';

import Nav from '@/components/Nav';
import Connecting from '@/components/Connecting';
import About from '@/components/About';
import Settings from '@/components/Settings';
import Welcome from '@/components/Welcome';
import RoomLocked from '@/components/RoomLocked';

import ActivityList from './ActivityList';

import styles from './styles.module.scss';

const crypto = new Crypto();

ReactModal.setAppElement('#root');

const Modal = ({
  closeModal,
  modalComponent,
  roomId,
  translations,
  toggleSoundEnabled,
  togglePersistenceEnabled,
  soundIsEnabled,
  persistenceIsEnabled,
  toggleNotificationEnabled,
  toggleNotificationAllowed,
  notificationIsEnabled,
  notificationIsAllowed,
  setLanguage,
  language,
}) => {
  const getModal = () => {
    switch (modalComponent) {
      case 'Connecting':
        return {
          component: <Connecting />,
          title: 'Connecting...',
          preventClose: true,
        };
      case 'About':
        return {
          component: <About roomId={roomId} />,
          title: translations.aboutHeader,
        };
      case 'Settings':
        return {
          component: (
            <Settings
              roomId={roomId}
              toggleSoundEnabled={toggleSoundEnabled}
              togglePersistenceEnabled={togglePersistenceEnabled}
              soundIsEnabled={soundIsEnabled}
              persistenceIsEnabled={persistenceIsEnabled}
              toggleNotificationEnabled={toggleNotificationEnabled}
              toggleNotificationAllowed={toggleNotificationAllowed}
              notificationIsEnabled={notificationIsEnabled}
              notificationIsAllowed={notificationIsAllowed}
              setLanguage={setLanguage}
              language={language}
              translations={translations}
            />
          ),
          title: translations.settingsHeader,
        };
      case 'Welcome':
        return {
          component: <Welcome roomId={roomId} close={closeModal} translations={translations} />,
          title: translations.welcomeHeader,
        };
      case 'Room Locked':
        return {
          component: <RoomLocked modalContent={translations.lockedRoomHeader} />,
          title: translations.lockedRoomHeader,
          preventClose: true,
        };
      default:
        return {
          component: null,
          title: null,
        };
    }
  };

  const modalOpts = getModal();
  return (
    <ReactModal
      isOpen={Boolean(modalComponent)}
      contentLabel="Modal"
      style={{ overlay: { zIndex: 10 } }}
      className={{
        base: 'react-modal-content',
        afterOpen: 'react-modal-content_after-open',
        beforeClose: 'react-modal-content_before-close',
      }}
      overlayClassName={{
        base: 'react-modal-overlay',
        afterOpen: 'react-modal-overlay_after-open',
        beforeClose: 'react-modal-overlay_before-close',
      }}
      shouldCloseOnOverlayClick={!modalOpts.preventClose}
      onRequestClose={closeModal}
    >
      <div className="react-modal-header">
        {!modalOpts.preventClose && (
          <button onClick={closeModal} className="btn btn-link btn-plain close-modal">
            <X />
          </button>
        )}
        <h3 className="react-modal-title">{modalOpts.title}</h3>
      </div>
      <div className="react-modal-component">{modalOpts.component}</div>
    </ReactModal>
  );
};

const Home = ({
  receiveEncryptedMessage,
  receiveUnencryptedMessage,
  activities,
  username,
  publicKey,
  members,
  socketId,
  roomId,
  roomLocked,
  modalComponent,
  openModal,
  closeModal,
  iAmOwner,
  userId,
  toggleWindowFocus,
  soundIsEnabled,
  persistenceIsEnabled,
  toggleSoundEnabled,
  togglePersistenceEnabled,
  notificationIsEnabled,
  notificationIsAllowed,
  toggleNotificationEnabled,
  toggleNotificationAllowed,
  toggleSocketConnected,
  socketConnected,
  sendUnencryptedMessage,
  sendEncryptedMessage,
  translations,
  setLanguage,
  language,
}) => {
  const socketPayloadRef = React.useRef({
    username: username,
    publicKey: publicKey,
    isOwner: iAmOwner,
    id: userId,
  });
  socketPayloadRef.current = {
    username: username,
    publicKey: publicKey,
    isOwner: iAmOwner,
    id: userId,
  };

  // Add blur et focus listeners
  React.useEffect(() => {
    const onFocus = () => {
      toggleWindowFocus(true);
    };
    const onBlur = () => {
      toggleWindowFocus(false);
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [toggleWindowFocus]);

  React.useEffect(() => {
    const socket = connectSocket(socketId);

    socket.on('disconnect', () => {
      toggleSocketConnected(false);
    });

    socket.on('connect', () => {
      socket.emit('USER_ENTER', {
        publicKey: socketPayloadRef.current.publicKey,
      });
      toggleSocketConnected(true);
    });

    socket.on('USER_ENTER', payload => {
      receiveUnencryptedMessage('USER_ENTER', payload);
      sendEncryptedMessage({
        type: 'ADD_USER',
        payload: socketPayloadRef.current,
      });
      if (payload.users.length === 1) {
        openModal('Welcome');
      }
    });

    socket.on('USER_EXIT', payload => {
      receiveUnencryptedMessage('USER_EXIT', payload);
    });

    socket.on('ENCRYPTED_MESSAGE', payload => {
      receiveEncryptedMessage(payload);
    });

    socket.on('TOGGLE_LOCK_ROOM', payload => {
      receiveUnencryptedMessage('TOGGLE_LOCK_ROOM', payload);
    });

    socket.on('ROOM_LOCKED', () => {
      openModal('Room Locked');
    });

    const onUnload = () => {
      socket.emit('USER_DISCONNECT');
    };

    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.removeEventListener('beforeunload', onUnload);
      onUnload();
      socket.close();
    };
  }, [
    openModal,
    receiveEncryptedMessage,
    receiveUnencryptedMessage,
    sendEncryptedMessage,
    socketId,
    toggleSocketConnected,
  ]);

  return (
    <div className={classNames(styles.styles, 'h-100')}>
      <div className="nav-container">
        {!socketConnected && (
          <div className="alert-banner">
            <span className="icon">
              <AlertCircle size="15" />
            </span>{' '}
            <span>Disconnected</span>
          </div>
        )}
        <Nav
          members={members}
          roomId={roomId}
          roomLocked={roomLocked}
          toggleLockRoom={() => sendUnencryptedMessage('TOGGLE_LOCK_ROOM')}
          openModal={openModal}
          iAmOwner={iAmOwner}
          userId={userId}
          translations={translations}
        />
      </div>
      <ActivityList openModal={openModal} activities={activities} />
      <Modal
        closeModal={closeModal}
        modalComponent={modalComponent}
        roomId={roomId}
        translations={translations}
        toggleSoundEnabled={toggleSoundEnabled}
        togglePersistenceEnabled={togglePersistenceEnabled}
        soundIsEnabled={soundIsEnabled}
        persistenceIsEnabled={persistenceIsEnabled}
        toggleNotificationEnabled={toggleNotificationEnabled}
        toggleNotificationAllowed={toggleNotificationAllowed}
        notificationIsEnabled={notificationIsEnabled}
        notificationIsAllowed={notificationIsAllowed}
        setLanguage={setLanguage}
        language={language}
      />
    </div>
  );
};

export const WithUser = ({ ...rest }) => {
  const [loaded, setLoaded] = React.useState(false);
  const loading = React.useRef(false);

  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  React.useEffect(() => {
    let mounted = true;

    const createUserLocal = async () => {
      const localUsername = user.username || nanoid();

      const encryptDecryptKeys = await crypto.createEncryptDecryptKeys();
      const exportedEncryptDecryptPrivateKey = await crypto.exportKey(encryptDecryptKeys.privateKey);
      const exportedEncryptDecryptPublicKey = await crypto.exportKey(encryptDecryptKeys.publicKey);

      if (!mounted) {
        loading.current = false;
        return;
      }

      const payload = {
        username: localUsername,
        publicKey: exportedEncryptDecryptPublicKey,
        privateKey: exportedEncryptDecryptPrivateKey,
      };
      dispatch(createUser(payload));

      dispatch({ type: 'CREATE_USER', payload });

      loading.current = false;
      setLoaded(true);
    };

    if (!loaded && !loading.current) {
      loading.current = true;
      createUserLocal();
    }

    return () => {
      loading.current = false;
      mounted = false;
    };
  }, [dispatch, loaded, user.username]);

  if (!loaded) {
    return null;
  }

  return <Home username={user.username} publicKey={user.publicKey} userId={user.id} {...rest} />;
};

WithUser.defaultProps = {
  modalComponent: null,
};

WithUser.propTypes = {
  receiveEncryptedMessage: PropTypes.func.isRequired,
  receiveUnencryptedMessage: PropTypes.func.isRequired,
  activities: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  socketId: PropTypes.string.isRequired,
  roomId: PropTypes.string.isRequired,
  roomLocked: PropTypes.bool.isRequired,
  modalComponent: PropTypes.string,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  iAmOwner: PropTypes.bool.isRequired,
  toggleWindowFocus: PropTypes.func.isRequired,
  soundIsEnabled: PropTypes.bool.isRequired,
  persistenceIsEnabled: PropTypes.bool.isRequired,
  toggleSoundEnabled: PropTypes.func.isRequired,
  togglePersistenceEnabled: PropTypes.func.isRequired,
  notificationIsEnabled: PropTypes.bool.isRequired,
  notificationIsAllowed: PropTypes.bool,
  toggleNotificationEnabled: PropTypes.func.isRequired,
  toggleNotificationAllowed: PropTypes.func.isRequired,
  toggleSocketConnected: PropTypes.func.isRequired,
  socketConnected: PropTypes.bool.isRequired,
  sendUnencryptedMessage: PropTypes.func.isRequired,
  sendEncryptedMessage: PropTypes.func.isRequired,
  setLanguage: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired,
};

export default WithUser;
