import React from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { Info, Settings, PlusCircle, User, Users, Lock, Unlock, Star } from 'react-feather';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import Clipboard from 'clipboard';
import $ from 'jquery';

import logoImg from '@/img/logo.png';
import Username from '@/components/Username';

const Nav = ({ members, roomId, userId, roomLocked, toggleLockRoom, openModal, iAmOwner, translations }) => {
  React.useEffect(() => {
    const clip = new Clipboard('.clipboard-trigger');

    clip.on('success', () => {
      $('.room-id').tooltip('show');
      setTimeout(() => {
        $('.room-id').tooltip('hide');
      }, 3000);
    });

    $(() => {
      $('.room-id').tooltip({
        trigger: 'manual',
      });
      $('.lock-room').tooltip({
        trigger: 'manual',
      });
    });
  }, []);

  const newRoom = () => {
    $('.navbar-collapse').collapse('hide');
    window.open(`/${nanoid()}`);
  };

  const handleSettingsClick = () => {
    $('.navbar-collapse').collapse('hide');
    openModal('Settings');
  };

  const handleAboutClick = () => {
    $('.navbar-collapse').collapse('hide');
    openModal('About');
  };

  const handleToggleLock = () => {
    if (!iAmOwner) {
      $('.lock-room').tooltip('show');
      setTimeout(() => $('.lock-room').tooltip('hide'), 3000);
      return;
    }
    toggleLockRoom();
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark">
      <div className="meta">
        <img src={logoImg} alt="Darkwire" className="logo" />

        <button
          data-toggle="tooltip"
          data-placement="bottom"
          title={translations.copyButtonTooltip}
          data-clipboard-text={`${window.location.origin}/${roomId}`}
          className="btn btn-plain btn-link clipboard-trigger room-id ellipsis"
        >
          {`/${roomId}`}
        </button>

        <span className="lock-room-container">
          <button
            onClick={handleToggleLock}
            className="lock-room btn btn-link btn-plain"
            data-toggle="tooltip"
            data-placement="bottom"
            title="You must be the owner to lock or unlock the room"
          >
            {roomLocked && <Lock />}
            {!roomLocked && <Unlock className="muted" />}
          </button>
        </span>

        <Dropdown className="members-dropdown">
          <DropdownTrigger>
            <button className="btn btn-link btn-plain members-action" title="Users">
              <Users className="users-icon" />
            </button>
            <span>{members.length}</span>
          </DropdownTrigger>
          <DropdownContent>
            <ul className="plain">
              {members.map((member, index) => (
                <li key={`user-${index}`}>
                  <Username username={member.username} />
                  <span className="icon-container">
                    {member.id === userId && (
                      <span data-toggle="tooltip" data-placement="bottom" title="Me" className="me-icon-wrap">
                        <User className="me-icon" />
                      </span>
                    )}
                    {member.isOwner && (
                      <span data-toggle="tooltip" data-placement="bottom" title="Owner" className="owner-icon-wrap">
                        <Star className="owner-icon" />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </DropdownContent>
        </Dropdown>
      </div>

      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <button className="btn btn-plain nav-link" onClick={newRoom} target="blank">
              <PlusCircle /> <span>{translations.newRoomButton}</span>
            </button>
          </li>
          <li className="nav-item">
            <button onClick={handleSettingsClick} className="btn btn-plain nav-link">
              <Settings /> <span>{translations.settingsButton}</span>
            </button>
          </li>
          <li className="nav-item">
            <button onClick={handleAboutClick} className="btn btn-plain nav-link">
              <Info /> <span>{translations.aboutButton}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

Nav.propTypes = {
  members: PropTypes.array.isRequired,
  roomId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  roomLocked: PropTypes.bool.isRequired,
  toggleLockRoom: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  iAmOwner: PropTypes.bool.isRequired,
  translations: PropTypes.object.isRequired,
};

export default Nav;
