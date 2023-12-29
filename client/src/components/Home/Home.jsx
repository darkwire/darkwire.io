import React, { Component } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { X, AlertCircle } from 'react-feather';
import classNames from 'classnames';

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

Modal.setAppElement('#root');

class Home extends Component {
  async componentWillMount() {
    const user = await this.createUser();

    const socket = connectSocket(this.props.socketId);

    this.socket = socket;

    socket.on('disconnect', () => {
      this.props.toggleSocketConnected(false);
    });

    socket.on('connect', () => {
      this.initApp(user);
      this.props.toggleSocketConnected(true);
    });

    socket.on('USER_ENTER', payload => {
      this.props.receiveUnencryptedMessage('USER_ENTER', payload);
      this.props.sendEncryptedMessage({
        type: 'ADD_USER',
        payload: {
          username: this.props.username,
          publicKey: this.props.publicKey,
          isOwner: this.props.iAmOwner,
          id: this.props.userId,
        },
      });
      if (payload.users.length === 1) {
        this.props.openModal('Welcome');
      }
    });

    socket.on('USER_EXIT', payload => {
      this.props.receiveUnencryptedMessage('USER_EXIT', payload);
    });

    socket.on('ENCRYPTED_MESSAGE', payload => {
      this.props.receiveEncryptedMessage(payload);
    });

    socket.on('TOGGLE_LOCK_ROOM', payload => {
      this.props.receiveUnencryptedMessage('TOGGLE_LOCK_ROOM', payload);
    });

    socket.on('ROOM_LOCKED', payload => {
      this.props.openModal('Room Locked');
    });

    window.addEventListener('beforeunload', evt => {
      socket.emit('USER_DISCONNECT');
    });
  }

  componentDidMount() {
    this.bindEvents();
  }

  getModal() {
    switch (this.props.modalComponent) {
      case 'Connecting':
        return {
          component: <Connecting />,
          title: 'Connecting...',
          preventClose: true,
        };
      case 'About':
        return {
          component: <About roomId={this.props.roomId} />,
          title: this.props.translations.aboutHeader,
        };
      case 'Settings':
        return {
          component: (
            <Settings
              roomId={this.props.roomId}
              toggleSoundEnabled={this.props.toggleSoundEnabled}
              togglePersistenceEnabled={this.props.togglePersistenceEnabled}
              soundIsEnabled={this.props.soundIsEnabled}
              persistenceIsEnabled={this.props.persistenceIsEnabled}
              toggleNotificationEnabled={this.props.toggleNotificationEnabled}
              toggleNotificationAllowed={this.props.toggleNotificationAllowed}
              notificationIsEnabled={this.props.notificationIsEnabled}
              notificationIsAllowed={this.props.notificationIsAllowed}
              setLanguage={this.props.setLanguage}
              language={this.props.language}
              translations={this.props.translations}
            />
          ),
          title: this.props.translations.settingsHeader,
        };
      case 'Welcome':
        return {
          component: (
            <Welcome roomId={this.props.roomId} close={this.props.closeModal} translations={this.props.translations} />
          ),
          title: this.props.translations.welcomeHeader,
        };
      case 'Room Locked':
        return {
          component: <RoomLocked modalContent={this.props.translations.lockedRoomHeader} />,
          title: this.props.translations.lockedRoomHeader,
          preventClose: true,
        };
      default:
        return {
          component: null,
          title: null,
        };
    }
  }

  initApp(user) {
    this.socket.emit('USER_ENTER', {
      publicKey: user.publicKey,
    });
  }

  bindEvents() {
    window.onfocus = () => {
      this.props.toggleWindowFocus(true);
    };

    window.onblur = () => {
      this.props.toggleWindowFocus(false);
    };
  }

  createUser() {
    return new Promise(async resolve => {
      const username = this.props.username || nanoid();

      const encryptDecryptKeys = await crypto.createEncryptDecryptKeys();
      const exportedEncryptDecryptPrivateKey = await crypto.exportKey(encryptDecryptKeys.privateKey);
      const exportedEncryptDecryptPublicKey = await crypto.exportKey(encryptDecryptKeys.publicKey);

      this.props.createUser({
        username,
        publicKey: exportedEncryptDecryptPublicKey,
        privateKey: exportedEncryptDecryptPrivateKey,
      });

      resolve({
        publicKey: exportedEncryptDecryptPublicKey,
      });
    });
  }

  render() {
    const modalOpts = this.getModal();
    return (
      <div className={classNames(styles.styles, 'h-100')}>
        <div className="nav-container">
          {!this.props.socketConnected && (
            <div className="alert-banner">
              <span className="icon">
                <AlertCircle size="15" />
              </span>{' '}
              <span>Disconnected</span>
            </div>
          )}
          <Nav
            members={this.props.members}
            roomId={this.props.roomId}
            roomLocked={this.props.roomLocked}
            toggleLockRoom={() => this.props.sendUnencryptedMessage('TOGGLE_LOCK_ROOM')}
            openModal={this.props.openModal}
            iAmOwner={this.props.iAmOwner}
            userId={this.props.userId}
            translations={this.props.translations}
          />
        </div>
        <ActivityList openModal={this.props.openModal} activities={this.props.activities} />
        <Modal
          isOpen={Boolean(this.props.modalComponent)}
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
          onRequestClose={this.props.closeModal}
        >
          <div className="react-modal-header">
            {!modalOpts.preventClose && (
              <button onClick={this.props.closeModal} className="btn btn-link btn-plain close-modal">
                <X />
              </button>
            )}
            <h3 className="react-modal-title">{modalOpts.title}</h3>
          </div>
          <div className="react-modal-component">{modalOpts.component}</div>
        </Modal>
      </div>
    );
  }
}

Home.defaultProps = {
  modalComponent: null,
};

Home.propTypes = {
  receiveEncryptedMessage: PropTypes.func.isRequired,
  receiveUnencryptedMessage: PropTypes.func.isRequired,
  createUser: PropTypes.func.isRequired,
  activities: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
  publicKey: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  socketId: PropTypes.string.isRequired,
  roomId: PropTypes.string.isRequired,
  roomLocked: PropTypes.bool.isRequired,
  modalComponent: PropTypes.string,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  iAmOwner: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  toggleWindowFocus: PropTypes.func.isRequired,
  faviconCount: PropTypes.number.isRequired,
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
};

export default Home;
