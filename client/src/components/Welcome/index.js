import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RoomLink from 'components/RoomLink';

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomUrl: `https://darkwire.io/${props.roomId}`,
    };
  }

  render() {
    return (
      <div>
        <div>
          v2.0 is a complete rewrite and includes several new features. Here are some highlights:
          <ul className="native">
            <li>Support on all modern browsers (Chrome, Firefox, Safari, Safari iOS, Android)</li>
            <li>Slash commands (/nick, /me, /clear)</li>
            <li>Room owners can lock the room, preventing anyone else from joining</li>
            <li>Front-end rewritten in React.js and Redux</li>
            <li>Send files up to 4 MB</li>
          </ul>
          <div>
            You can learn more{' '}
            <a href="https://github.com/darkwire/darkwire.io" target="_blank" rel="noopener noreferrer">
              here
            </a>
            .
          </div>
        </div>
        <br />
        <p className="mb-2">Others can join this room using the following URL:</p>
        <RoomLink roomId={this.props.roomId} translations={this.props.translations} />
        <div className="react-modal-footer">
          <button className="btn btn-primary btn-lg" onClick={this.props.close}>
            {this.props.translations.welcomeModalCTA}
          </button>
        </div>
      </div>
    );
  }
}

Welcome.propTypes = {
  roomId: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};

export default Welcome;
