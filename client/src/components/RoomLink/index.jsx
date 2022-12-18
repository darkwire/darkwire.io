import React from 'react';
import PropTypes from 'prop-types';
import { Copy } from 'react-feather';
import { Tooltip } from 'react-tooltip';

const RoomLink = ({ roomId, translations }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const mountedRef = React.useRef(true);

  const roomUrl = `${window.location.origin}/${roomId}`;

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClick = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setShowTooltip(true);
    setTimeout(() => {
      if (mountedRef.current) {
        setShowTooltip(false);
      }
    }, 2000);
  };

  return (
    <form>
      <div className="form-group">
        <div className="input-group">
          <input id="room-url" className="form-control" type="text" readOnly value={roomUrl} />
          <div className="input-group-append">
            <button
              id="copy-room"
              data-testid="copy-room-button"
              className="copy-room btn btn-secondary"
              type="button"
              onClick={handleClick}
            >
              <Copy />
            </button>
          </div>
          {showTooltip && (
            <Tooltip
              anchorId="copy-room"
              content={translations.copyButtonTooltip}
              place="top"
              events={[]}
              isOpen={true}
            />
          )}
        </div>
      </div>
    </form>
  );
};

RoomLink.propTypes = {
  roomId: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired,
};

export default RoomLink;
