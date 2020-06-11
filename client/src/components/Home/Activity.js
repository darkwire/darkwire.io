import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Message from 'components/Message'
import Username from 'components/Username'
import Notice from 'components/Notice'
import Zoom from 'utils/ImageZoom'
import { getObjectUrl } from 'utils/file'

import T from 'components/T'

class Activity extends Component {
  constructor(props) {
    super(props)

    this.state = {
      zoomableImages: [],
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

  handleImageDisplay() {
    Zoom(this._zoomableImage)
    this.props.scrollToBottom()
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

            <a target="_blank" href={downloadUrl} rel="noopener noreferrer" download={activity.fileName}>
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
                filename: <a key={0} target="_blank" href={url} rel="noopener noreferrer" download={activity.fileName}>{activity.fileName}</a>,
              }} path='sentFile'/>&nbsp;
            </div>
            {this.getFileDisplay(activity)}
          </Notice>
        )
      default:
        return false
    }
  }

  render() {
    return (
      this.getActivityComponent(this.props.activity)
    )
  }
}

Activity.propTypes = {
  activity: PropTypes.object.isRequired,
  scrollToBottom: PropTypes.func.isRequired,
}

export default Activity;
