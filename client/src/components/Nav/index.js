import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shortId from 'shortid';
import { Info, Settings, PlusCircle, User, Users, Lock, Unlock, Star } from 'react-feather';
import logoImg from 'img/logo.png';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import Username from 'components/Username';
import Clipboard from 'clipboard';
import $ from 'jquery';

class Nav extends Component {
  componentDidMount() {
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
  }

  componentDidUpdate() {
    $(() => {
      $('.me-icon-wrap').tooltip();
      $('.owner-icon-wrap').tooltip();
    });
  }

  newRoom() {
    $('.navbar-collapse').collapse('hide');
    window.open(`/${shortId.generate()}`);
  }

  handleSettingsClick() {
    $('.navbar-collapse').collapse('hide');
    this.props.openModal('Settings');
  }

  handleAboutClick() {
    $('.navbar-collapse').collapse('hide');
    this.props.openModal('About');
  }

  handleToggleLock() {
    if (!this.props.iAmOwner) {
      $('.lock-room').tooltip('show');
      setTimeout(() => $('.lock-room').tooltip('hide'), 3000);
      return;
    }
    this.props.toggleLockRoom();
  }

  render() {
    return (
      <nav className="navbar navbar-expand-md navbar-dark">
        <div className="meta">
          <img src={logoImg} alt="Darkwire" className="logo" />

          <button
            data-toggle="tooltip"
            data-placement="bottom"
            title={this.props.translations.copyButtonTooltip}
            data-clipboard-text={`${window.location.origin}/${this.props.roomId}`}
            className="btn btn-plain btn-link clipboard-trigger room-id ellipsis"
          >
            {`/${this.props.roomId}`}
          </button>

          <span className="lock-room-container">
            <button
              onClick={this.handleToggleLock.bind(this)}
              className="lock-room btn btn-link btn-plain"
              data-toggle="tooltip"
              data-placement="bottom"
              title="You must be the owner to lock or unlock the room"
            >
              {this.props.roomLocked && <Lock />}
              {!this.props.roomLocked && <Unlock className="muted" />}
            </button>
          </span>

          <Dropdown className="members-dropdown">
            <DropdownTrigger>
              <button className="btn btn-link btn-plain members-action" title="Users">
                <Users className="users-icon" />
              </button>
              <span>{this.props.members.length}</span>
            </DropdownTrigger>
            <DropdownContent>
              <ul className="plain">
                {this.props.members.map((member, index) => (
                  <li key={`user-${index}`}>
                    <Username username={member.username} />
                    <span className="icon-container">
                      {member.id === this.props.userId && (
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
              <button className="btn btn-plain nav-link" onClick={this.newRoom.bind(this)} target="blank">
                <PlusCircle /> <span>{this.props.translations.newRoomButton}</span>
              </button>
            </li>
            <li
              className="
            nav-item"
            >
              <button onClick={this.handleSettingsClick.bind(this)} className="btn btn-plain nav-link">
                <Settings /> <span>{this.props.translations.settingsButton}</span>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={this.handleAboutClick.bind(this)} className="btn btn-plain nav-link">
                <Info /> <span>{this.props.translations.aboutButton}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

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
