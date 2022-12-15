import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Copy } from 'react-feather';
import Clipboard from 'clipboard';
import $ from 'jquery';

const RoomLink = ({ roomId, translations }) => {
  const roomUrl = `${window.location.origin}/${roomId}`;

  React.useEffect(() => {
    const clip = new Clipboard('.copy-room');

    clip.on('success', () => {
      $('.copy-room').tooltip('show');
      setTimeout(() => {
        $('.copy-room').tooltip('hide');
      }, 3000);
    });

    $(() => {
      $('.copy-room').tooltip({
        trigger: 'manual',
      });
    });

    return () => {
      if ($('.copy-room').tooltip) $('.copy-room').tooltip('hide');
    };
  }, []);

  return (
    <form>
      <div className="form-group">
        <div className="input-group">
          <input id="room-url" className="form-control" type="text" readOnly value={roomUrl} />
          <div className="input-group-append">
            <button
              className="copy-room btn btn-secondary"
              type="button"
              data-toggle="tooltip"
              data-placement="bottom"
              data-clipboard-text={roomUrl}
              title={translations.copyButtonTooltip}
            >
              <Copy />
            </button>
          </div>
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
