import Home from './Home'
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
