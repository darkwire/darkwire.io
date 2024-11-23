import PropTypes from 'prop-types';
import RoomLink from '@/components/RoomLink';

const Welcome = ({ roomId, translations, close }) => {
  return (
    <div>
      <div>
        v2.0 is a complete rewrite and includes several new features. Here are some highlights:
        <ul className="native">
          <li>Support on all modern browsers (Chrome, Firefox, Safari, Safari iOS, Android)</li>
          <li>Slash commands (/nick, /me, /clear)</li>
          <li>Room owners can lock the room, preventing anyone else from joining</li>
          <li>Send files</li>
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
      <RoomLink roomId={roomId} translations={translations} />
      <div className="react-modal-footer">
        <button className="btn btn-primary btn-lg" onClick={close}>
          {translations.welcomeModalCTA}
        </button>
      </div>
    </div>
  );
};

Welcome.propTypes = {
  roomId: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};

export default Welcome;
