import { connect } from 'react-redux'
import { sendEncryptedMessage } from 'actions'
import ChatInput from 'components/Chat'

const mapStateToProps = () => ({
})

const mapDispatchToProps = {
  sendEncryptedMessage,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatInput)
