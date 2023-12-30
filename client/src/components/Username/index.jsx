import PropTypes from 'prop-types';
import randomColor from 'randomcolor';

const Username = ({ username }) => {
  return (
    <span className="username" style={{ color: randomColor({ seed: username, luminosity: 'light' }) }}>
      {username}
    </span>
  );
};

Username.propTypes = {
  username: PropTypes.string.isRequired,
};

export default Username;
