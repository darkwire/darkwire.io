import React from 'react';
import PropTypes from 'prop-types';
import { Clipboard } from 'react-feather'; // Import Clipboard icon for the copy button
import { Tooltip } from 'react-tooltip';

const RoomLink = ({ roomId, translations }) => {
  const [currentRoomId, setCurrentRoomId] = React.useState(roomId);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipMessage, setTooltipMessage] = React.useState('');
  const mountedRef = React.useRef(true);

  const roomUrl = `${window.location.origin}/${currentRoomId}`;

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setTooltipMessage(translations.copyButtonTooltip);
    setShowTooltip(true);
    setTimeout(() => {
      if (mountedRef.current) {
        setShowTooltip(false);
      }
    }, 2000);
  };

  const handleRefreshClick = () => {
    window.location.href = roomUrl; // Reload the page with the current room URL
  };

  const handleRoomIdChange = (e) => {
    setCurrentRoomId(e.target.value);
  };

  return (
    <div>
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
                onClick={handleCopyClick}
              >
                <Clipboard />
              </button>
            </div>
            {showTooltip && (
              <Tooltip
                anchorId="copy-room"
                content={tooltipMessage}
                place="top"
                events={[]}
                isOpen={true}
              />
            )}
          </div>
        </div>
      </form>

      <div className="form-group mt-3">
        <label htmlFor="current-room-id">Change Room ID</label>
        <div className="input-group">
          <input
            id="current-room-id"
            className="form-control"
            type="text"
            value={currentRoomId}
            onChange={handleRoomIdChange}
          />
          <div className="input-group-append">
            <button
              id="refresh-room-id"
              data-testid="refresh-room-id-button"
              className="btn btn-primary" // Change button class for visibility
              type="button"
              onClick={handleRefreshClick}
            >
              Go {/* Replace icon with text */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

RoomLink.propTypes = {
  roomId: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired,
};

export default RoomLink;
