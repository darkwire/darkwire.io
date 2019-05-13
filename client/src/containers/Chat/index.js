import { connect } from 'react-redux'
import { sendSocketMessage } from 'actions'
import ChatInput from 'components/Chat'

const mapStateToProps = () => ({
})

const mapDispatchToProps = {
  sendSocketMessage,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatInput)
