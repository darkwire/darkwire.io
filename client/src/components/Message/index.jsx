import PropTypes from 'prop-types';
import moment from 'moment';
import Linkify from 'react-linkify';

import Username from '@/components/Username';

const Message = ({ message, timestamp, sender }) => {
  const msg = decodeURI(message);

  return (
    <div>
      <div className="chat-meta">
        <Username username={sender} />
        <span className="muted timestamp">{moment(timestamp).format('LT')}</span>
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
};

Message.propTypes = {
  sender: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
};

export default Message;
