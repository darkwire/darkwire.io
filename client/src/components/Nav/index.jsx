import React from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { Info, Settings, PlusCircle, User, Users, Lock, Unlock, Star } from 'react-feather';
import $ from 'jquery';
import { Tooltip } from 'react-tooltip';
import { useClickOutside, useSafeState } from '@react-hookz/web/esnext';

import logoImg from '@/img/logo.png';
import Username from '@/components/Username';

const Nav = ({ members, roomId, userId, roomLocked, toggleLockRoom, openModal, iAmOwner, translations }) => {
  const [showCopyTooltip, setShowCopyTooltip] = useSafeState(false);
  const [showLockedTooltip, setShowLockedTooltip] = useSafeState(false);
  const [showMemberList, setShowMemberList] = useSafeState(false);
  const userListRef = React.useRef(null);
  const roomUrl = `${window.location.origin}/${roomId}`;

  useClickOutside(userListRef, () => {
    setShowMemberList(false);
  });

  const newRoom = () => {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      new bootstrap.Collapse(navbarCollapse).hide();
    }
    window.open(`/${nanoid()}`);
  };
  
  const handleSettingsClick = () => {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      new bootstrap.Collapse(navbarCollapse).hide();
    }
    openModal('Settings');
  };
  
  const handleAboutClick = () => {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      new bootstrap.Collapse(navbarCollapse).hide();
    }
    openModal('About');
  };

  const handleToggleLock = () => {
    if (!iAmOwner) {
      setShowLockedTooltip(true);
      setTimeout(() => {
        setShowLockedTooltip(false);
      }, 2000);
    } else {
      toggleLockRoom();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setShowCopyTooltip(true);
    setTimeout(() => {
      setShowCopyTooltip(false);
    }, 2000);
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark">
      <div className="meta">
        <img src={logoImg} alt="Darkwire" className="logo" />

        <button
          id="copy-room-url-button"
          className="btn btn-plain btn-link clipboard-trigger room-id ellipsis"
          onClick={handleCopy}
        >
          {`/${roomId}`}
        </button>
        {showCopyTooltip && (
          <Tooltip
            anchorId="copy-room-url-button"
            content={translations.copyButtonTooltip}
            place="bottom"
            events={[]}
            isOpen={true}
          />
        )}
        <span className="lock-room-container">
          <button
            id="lock-room-button"
            data-testid="lock-room-button"
            onClick={handleToggleLock}
            className="lock-room btn btn-link btn-plain"
          >
            {roomLocked && <Lock />}
            {!roomLocked && <Unlock className="muted" />}
          </button>
          {showLockedTooltip && (
            <Tooltip
              anchorId="lock-room-button"
              content="You must be the owner to lock or unlock the room"
              place="bottom"
              events={[]}
              isOpen={true}
            />
          )}
        </span>
        <div className="members-menu" ref={userListRef}>
          <button
            className="btn btn-link btn-plain members-action"
            title="Users"
            onClick={() => setShowMemberList(prev => !prev)}
          >
            <Users className="users-icon" />
          </button>
          <span>{members.length}</span>

          {showMemberList && (
            <ul className="member-list">
              {members.map((member, index) => (
                <li key={`user-${index}`}>
                  <Username username={member.username} />
                  <span className="icon-container">
                    {member.id === userId && (
                      <span className="me-icon-wrap" title="Me">
                        <User className="me-icon" />
                      </span>
                    )}
                    {member.isOwner && (
                      <span className="owner-icon-wrap">
                        <Star className="owner-icon" title="Owner" />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
