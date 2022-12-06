import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Linkify from 'react-linkify';

import Username from '@/components/Username';

class Message extends Component {
  render() {
    const msg = decodeURI(this.props.message);

    return (
      <div>
        <div className="chat-meta">
          <Username username={this.props.sender} />
          <span className="muted timestamp">{moment(this.props.timestamp).format('LT')}</span>
        </div>
        <div className="chat">
          <Linkify
            properties={{
              target: '_blank',
              rel: 'noopener noreferrer',
            }}
          >
            {msg}
          </Linkify>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  sender: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
};

export default Message;
