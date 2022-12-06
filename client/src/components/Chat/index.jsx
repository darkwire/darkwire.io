import Chat from './Chat';
import { connect } from 'react-redux';
import { clearActivities, showNotice, sendEncryptedMessage } from '@/actions';

const mapStateToProps = state => ({
  username: state.user.username,
  userId: state.user.id,
  translations: state.app.translations,
});

const mapDispatchToProps = {
  clearActivities,
  showNotice,
  sendEncryptedMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
