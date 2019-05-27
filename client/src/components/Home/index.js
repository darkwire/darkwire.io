import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Crypto from 'utils/crypto'
import { connect } from 'utils/socket'
import Nav from 'components/Nav'
import shortId from 'shortid'
import ChatInput from 'containers/Chat'
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

import styles from './styles.module.scss'

const crypto = new Crypto()

Modal.setAppElement('#root');

export default class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      zoomableImages: [],
      focusChat: false,
    }

    this.hasConnected = false
  }

  async componentWillMount() {
    console.log(this.props.dispatch);
    const roomId = encodeURI(this.props.match.params.roomId)

    const user = await this.createUser()

    const socket = connect(roomId)

    const disconnectEvents = [
      'disconnect',
    ]

    disconnectEvents.forEach((evt) => {
      socket.on(evt, () => {
        this.props.toggleSocketConnected(false)
      })
    })

    const connectEvents = [
      'connect',
    ]

    connectEvents.forEach((evt) => {
      socket.on(evt, () => {
        this.initApp(user)
        this.props.toggleSocketConnected(true)
      })
    })

    socket.on('USER_ENTER', (payload) => {
      this.props.receiveUserEnter(payload)
      this.props.sendEncryptedMessage({
        type: 'ADD_USER',
        payload: {
          username: this.props.username,
          publicKey: this.props.publicKey,
          isOwner: this.props.iAmOwner,
          id: this.props.userId,
        },
      })
    })

    socket.on('USER_EXIT', (payload) => {
      this.props.receiveUserExit(payload)
    })

    socket.on('ENCRYPTED_MESSAGE', (payload) => {
      this.props.receiveEncryptedMessage(payload)
    })

    socket.on('TOGGLE_LOCK_ROOM', (payload) => {
      this.props.receiveToggleLockRoom(payload)
    })

    socket.on('ROOM_LOCKED', (payload) => {
      this.props.openModal('Room Locked')
    });

    window.addEventListener('beforeunload', (evt) => {
      this.props.sendUserDisconnect();
    });
  }

  componentDidMount() {
    this.bindEvents()

    if (this.props.joining) {
      this.props.openModal('Connecting')
    }

    this.beep = window.Audio && new window.Audio(beepFile)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.joining && !nextProps.joining) {
      this.props.closeModal()
    }

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
            <div><Username username={activity.username} /> joined</div>
          </Notice>
        )
      case 'USER_EXIT':
        return (
          <Notice>
            <div><Username username={activity.username} /> left</div>
          </Notice>
        )
      case 'TOGGLE_LOCK_ROOM':
        const lockedWord = activity.locked ? 'locked' : 'unlocked'
        return (
          <Notice>
            <div><Username username={activity.username} /> {lockedWord} the room</div>
          </Notice>
        )
      case 'NOTICE':
        return (
          <Notice>
            <div>{activity.message}</div>
          </Notice>
        )
      case 'CHANGE_USERNAME':
        return (
          <Notice>
            <div><Username username={activity.currentUsername} /> changed their name to <Username username={activity.newUsername} /></div>
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
            <Username username={activity.username} /> sent you a file. <a target="_blank" href={downloadUrl} rel="noopener noreferrer">Download {activity.fileName}</a>
            {this.getFileDisplay(activity)}
          </div>
        )
      case 'SEND_FILE':
        const url = getObjectUrl(activity.encodedFile, activity.fileType)
        return (
          <Notice>
            <div>You sent <a target="_blank" href={url} rel="noopener noreferrer">{activity.fileName}</a></div>
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
          title: 'About',
        }
      case 'Settings':
        return {
          component: <Settings roomId={this.props.roomId} toggleSoundEnabled={this.props.toggleSoundEnabled} soundIsEnabled={this.props.soundIsEnabled} />,
          title: 'Settings & Help',
        }
      case 'Welcome':
        return {
          component: <Welcome roomId={this.props.roomId} close={this.props.closeModal} />,
          title: 'Welcome to Darkwire v2.0',
        }
      case 'Room Locked':
        return {
          component: <RoomLocked />,
          title: 'This room is locked',
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
    this.props.sendUserEnter({
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
            toggleLockRoom={this.props.toggleLockRoom}
            openModal={this.props.openModal}
            iAmOwner={this.props.iAmOwner}
            userId={this.props.userId}
          />
        </div>
        <div className="main-chat">
          <div onClick={this.handleChatClick.bind(this)} className="message-stream h-100" ref={el => this.messageStream = el}>
            <ul className="plain" ref={el => this.activitiesList = el}>
              <li><p className={styles.tos}><button className='btn btn-link' onClick={this.props.openModal.bind(this, 'About')}> By using Darkwire, you are agreeing to our Acceptable Use Policy and Terms of Service.</button></p></li>
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
  sendEncryptedMessage: PropTypes.func.isRequired,
  createUser: PropTypes.func.isRequired,
  receiveUserExit: PropTypes.func.isRequired,
  receiveUserEnter: PropTypes.func.isRequired,
  activities: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
  publicKey: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  roomLocked: PropTypes.bool.isRequired,
  toggleLockRoom: PropTypes.func.isRequired,
  receiveToggleLockRoom: PropTypes.func.isRequired,
  modalComponent: PropTypes.string,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  setScrolledToBottom: PropTypes.func.isRequired,
  scrolledToBottom: PropTypes.bool.isRequired,
  iAmOwner: PropTypes.bool.isRequired,
  sendUserEnter: PropTypes.func.isRequired,
  sendUserDisconnect: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  joining: PropTypes.bool.isRequired,
  toggleWindowFocus: PropTypes.func.isRequired,
  faviconCount: PropTypes.number.isRequired,
  soundIsEnabled: PropTypes.bool.isRequired,
  toggleSoundEnabled: PropTypes.func.isRequired,
  toggleSocketConnected: PropTypes.func.isRequired,
  socketConnected: PropTypes.bool.isRequired,
}
