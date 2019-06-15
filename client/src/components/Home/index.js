import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Crypto from 'utils/crypto'
import { connect as connectSocket } from 'utils/socket'
import Nav from 'components/Nav'
import shortId from 'shortid'
import ChatInput from 'components/Chat'
import Connecting from 'components/Connecting'
import Message from 'components/Message'
import Username from 'components/Username'
import Notice from 'components/Notice'
import Modal from 'react-modal'
import About from 'components/About'
import Settings from 'components/Settings'
import Welcome from 'components/Welcome'
import RoomLocked from 'components/RoomLocked'
import { X, AlertCircle } from 'react-feather'
import { defer } from 'lodash'
import Tinycon from 'tinycon'
import beepFile from 'audio/beep.mp3'
import Zoom from 'utils/ImageZoom'
import classNames from 'classnames'
import { getObjectUrl } from 'utils/file'
import { connect } from 'react-redux'
import {
  receiveEncryptedMessage,
  createUser,
  openModal,
  closeModal,
  setScrolledToBottom,
  toggleWindowFocus,
  toggleSoundEnabled,
  toggleSocketConnected,
  receiveUnencryptedMessage,
  sendUnencryptedMessage,
  sendEncryptedMessage,
  setLanguage
} from 'actions'
import T from 'components/T'

import styles from './styles.module.scss'

const crypto = new Crypto()

Modal.setAppElement('#root');

class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      zoomableImages: [],
      focusChat: false,
    }

    this.hasConnected = false
  }

  async componentWillMount() {
    const roomId = encodeURI(this.props.match.params.roomId)

    const user = await this.createUser()

    const socket = connectSocket(roomId)

    this.socket = socket;

    socket.on('disconnect', () => {
      this.props.toggleSocketConnected(false)
    })

    socket.on('connect', () => {
      this.initApp(user)
      this.props.toggleSocketConnected(true)
    })

    socket.on('USER_ENTER', (payload) => {
      this.props.receiveUnencryptedMessage('USER_ENTER', payload)
      this.props.sendEncryptedMessage({
        type: 'ADD_USER',
        payload: {
          username: this.props.username,
          publicKey: this.props.publicKey,
          isOwner: this.props.iAmOwner,
          id: this.props.userId,
        },
      })
      if (payload.users.length === 1) {
        this.props.openModal('Welcome');
      }
    })

    socket.on('USER_EXIT', (payload) => {
      this.props.receiveUnencryptedMessage('USER_EXIT', payload)
    })

    socket.on('ENCRYPTED_MESSAGE', (payload) => {
      this.props.receiveEncryptedMessage(payload)
    })

    socket.on('TOGGLE_LOCK_ROOM', (payload) => {
      this.props.receiveUnencryptedMessage('TOGGLE_LOCK_ROOM', payload)
    })

    socket.on('ROOM_LOCKED', (payload) => {
      this.props.openModal('Room Locked')
    });

    window.addEventListener('beforeunload', (evt) => {
      socket.emit('USER_DISCONNECT')
    });
  }

  componentDidMount() {
    this.bindEvents()

    this.beep = window.Audio && new window.Audio(beepFile)
  }

  componentWillReceiveProps(nextProps) {
    Tinycon.setBubble(nextProps.faviconCount)

    if (nextProps.faviconCount !== 0 && nextProps.faviconCount !== this.props.faviconCount && this.props.soundIsEnabled) {
      this.beep.play()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activities.length < this.props.activities.length) {
      this.scrollToBottomIfShould()
    }
  }

  onScroll() {
    const messageStreamHeight = this.messageStream.clientHeight
    const activitiesListHeight = this.activitiesList.clientHeight

    const bodyRect = document.body.getBoundingClientRect()
    const elemRect = this.activitiesList.getBoundingClientRect()
    const offset = elemRect.top - bodyRect.top
    const activitiesListYPos = offset

    const scrolledToBottom = (activitiesListHeight + (activitiesListYPos - 60)) <= messageStreamHeight
    if (scrolledToBottom) {
      if (!this.props.scrolledToBottom) {
        this.props.setScrolledToBottom(true)
      }
    } else if (this.props.scrolledToBottom) {
      this.props.setScrolledToBottom(false)
    }
  }

  getFileDisplay(activity) {
    const type = activity.fileType
    if (type.match('image.*')) {
      return (
        <img
          ref={c => this._zoomableImage = c}
          className="image-transfer zoomable"
          src={`data:${activity.fileType};base64,${activity.encodedFile}`}
          alt={`${activity.fileName} from ${activity.username}`}
          onLoad={this.handleImageDisplay.bind(this)}
        />
      )
    }
    return null
  }

  getActivityComponent(activity) {
    switch (activity.type) {
      case 'TEXT_MESSAGE':
        return (
          <Message
            sender={activity.username}
            message={activity.text}
            timestamp={activity.timestamp}
          />
        )
      case 'USER_ENTER':
        return (
          <Notice>
            <div>
              <T data={{
                username: <Username key={0} username={activity.username} />
              }} path='userJoined'/>
            </div>
          </Notice>
        )
      case 'USER_EXIT':
        return (
          <Notice>
            <div>
              <T data={{
                username: <Username key={0} username={activity.username} />
              }} path='userLeft'/>
            </div>
          </Notice>
        )
      case 'TOGGLE_LOCK_ROOM':
        if (activity.locked) {
          return (
            <Notice>
              <div><T data={{
                username: <Username key={0} username={activity.username} />
              }} path='lockedRoom'/></div>
            </Notice>
          )
        } else {
          return (
            <Notice>
              <div><T data={{
                username: <Username key={0} username={activity.username} />
              }} path='unlockedRoom'/></div>
            </Notice>
          )
        }
      case 'NOTICE':
        return (
          <Notice>
            <div>{activity.message}</div>
          </Notice>
        )
      case 'CHANGE_USERNAME':
        return (
          <Notice>
            <div><T data={{
              oldUsername: <Username key={0} username={activity.currentUsername} />,
              newUsername: <Username key={1} username={activity.newUsername} />
            }} path='nameChange'/>
            </div>
          </Notice>
        )
      case 'USER_ACTION':
        return (
          <Notice>
            <div>&#42; <Username username={activity.username} /> {activity.action}</div>
          </Notice>
        )
      case 'RECEIVE_FILE':
        const downloadUrl = getObjectUrl(activity.encodedFile, activity.fileType)
        return (
          <div>
            <T data={{
              username: <Username key={0} username={activity.username} />,
            }} path='userSentFile'/>&nbsp;

            <a target="_blank" href={downloadUrl} rel="noopener noreferrer">
              <T data={{
                filename: activity.fileName,
              }} path='downloadFile'/>
            </a>
            {this.getFileDisplay(activity)}
          </div>
        )
      case 'SEND_FILE':
        const url = getObjectUrl(activity.encodedFile, activity.fileType)
        return (
          <Notice>
            <div>
              <T data={{
                filename: <a key={0} target="_blank" href={url} rel="noopener noreferrer">{activity.fileName}</a>,
              }} path='sentFile'/>&nbsp;
            </div>
            {this.getFileDisplay(activity)}
          </Notice>
        )
      default:
        return false
    }
  }

  getModal() {
    switch (this.props.modalComponent) {
      case 'Connecting':
        return {
          component: <Connecting />,
          title: 'Connecting...',
          preventClose: true,
        }
      case 'About':
        return {
          component: <About roomId={this.props.roomId} />,
          title: this.props.translations.aboutHeader,
        }
      case 'Settings':
        return {
          component: <Settings roomId={this.props.roomId} toggleSoundEnabled={this.props.toggleSoundEnabled} soundIsEnabled={this.props.soundIsEnabled} setLanguage={this.props.setLanguage} language={this.props.language} translations={this.props.translations} />,
          title: this.props.translations.settingsHeader,
        }
      case 'Welcome':
        return {
          component: <Welcome roomId={this.props.roomId} close={this.props.closeModal} translations={this.props.translations} />,
          title: this.props.translations.welcomeHeader,
        }
      case 'Room Locked':
        return {
          component: <RoomLocked modalContent={this.props.translations.lockedRoomHeader} />,
          title: this.props.translations.lockedRoomHeader,
          preventClose: true,
        }
      default:
        return {
          component: null,
          title: null,
        }
    }
  }

  initApp(user) {
    this.socket.emit('USER_ENTER', {
      publicKey: user.publicKey,
    })
  }

  handleImageDisplay() {
    Zoom(this._zoomableImage)
    this.scrollToBottomIfShould()
  }

  scrollToBottomIfShould() {
    if (this.props.scrolledToBottom) {
      setTimeout(() => {
        this.messageStream.scrollTop = this.messageStream.scrollHeight
      }, 0)
    }
  }

  scrollToBottom() {
    this.messageStream.scrollTop = this.messageStream.scrollHeight
    this.props.setScrolledToBottom(true)
  }

  bindEvents() {
    this.messageStream.addEventListener('scroll', this.onScroll.bind(this))

    window.onfocus = () => {
      this.props.toggleWindowFocus(true)
    }

    window.onblur = () => {
      this.props.toggleWindowFocus(false)
    }
  }

  createUser() {
    return new Promise(async (resolve) => {
      const username = shortId.generate()

      const encryptDecryptKeys = await crypto.createEncryptDecryptKeys()
      const exportedEncryptDecryptPrivateKey = await crypto.exportKey(encryptDecryptKeys.privateKey)
      const exportedEncryptDecryptPublicKey = await crypto.exportKey(encryptDecryptKeys.publicKey)

      this.props.createUser({
        username,
        publicKey: exportedEncryptDecryptPublicKey,
        privateKey: exportedEncryptDecryptPrivateKey,
      })

      resolve({
        publicKey: exportedEncryptDecryptPublicKey,
      })
    })
  }

  handleChatClick() {
    this.setState({ focusChat: true })
    defer(() => this.setState({ focusChat: false }))
  }

  render() {
    const modalOpts = this.getModal()
    return (
      <div className={classNames(styles.styles, 'h-100')}>
        <div className="nav-container">
          {!this.props.socketConnected &&
            <div className="alert-banner">
              <span className="icon"><AlertCircle size="15" /></span> <span>Disconnected</span>
            </div>
          }
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
        <div className="main-chat">
          <div onClick={this.handleChatClick.bind(this)} className="message-stream h-100" ref={el => this.messageStream = el}>
            <ul className="plain" ref={el => this.activitiesList = el}>
              <li><p className={styles.tos}><button className='btn btn-link' onClick={this.props.openModal.bind(this, 'About')}> <T path='agreement'/></button></p></li>
              {this.props.activities.map((activity, index) => (
                <li key={index} className={`activity-item ${activity.type}`}>
                  {this.getActivityComponent(activity)}
                </li>
              ))}
            </ul>
          </div>
          <div className="chat-container">
            <ChatInput scrollToBottom={this.scrollToBottom.bind(this)} focusChat={this.state.focusChat} />
          </div>
        </div>
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
            {!modalOpts.preventClose &&
              <button onClick={this.props.closeModal} className="btn btn-link btn-plain close-modal">
                <X />
              </button>
            }
            <h3 className="react-modal-title">
              {modalOpts.title}
            </h3>
          </div>
          <div className="react-modal-component">
            {modalOpts.component}
          </div>
        </Modal>
      </div>
    )
  }
}

Home.defaultProps = {
  modalComponent: null,
}

Home.propTypes = {
  receiveEncryptedMessage: PropTypes.func.isRequired,
  createUser: PropTypes.func.isRequired,
  activities: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
  publicKey: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  roomLocked: PropTypes.bool.isRequired,
  modalComponent: PropTypes.string,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  setScrolledToBottom: PropTypes.func.isRequired,
  scrolledToBottom: PropTypes.bool.isRequired,
  iAmOwner: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  toggleWindowFocus: PropTypes.func.isRequired,
  faviconCount: PropTypes.number.isRequired,
  soundIsEnabled: PropTypes.bool.isRequired,
  toggleSoundEnabled: PropTypes.func.isRequired,
  toggleSocketConnected: PropTypes.func.isRequired,
  socketConnected: PropTypes.bool.isRequired,
  sendUnencryptedMessage: PropTypes.func.isRequired,
  sendEncryptedMessage: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  const me = state.room.members.find(m => m.id === state.user.id)

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
    scrolledToBottom: state.app.scrolledToBottom,
    iAmOwner: Boolean(me && me.isOwner),
    faviconCount: state.app.unreadMessageCount,
    soundIsEnabled: state.app.soundIsEnabled,
    socketConnected: state.app.socketConnected,
    language: state.app.language,
    translations: state.app.translations,
  }
}

const mapDispatchToProps = {
  receiveEncryptedMessage,
  createUser,
  openModal,
  closeModal,
  setScrolledToBottom,
  toggleWindowFocus,
  toggleSoundEnabled,
  toggleSocketConnected,
  receiveUnencryptedMessage,
  sendUnencryptedMessage,
  sendEncryptedMessage,
  setLanguage
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
