import React, { Component } from 'react'
import PropTypes from 'prop-types'
import RoomLink from 'components/RoomLink'
import {styles} from './styles.module.scss'

class Settings extends Component {
  handleSoundToggle() {
    this.props.toggleSoundEnabled(!this.props.soundIsEnabled)
  }

  render() {
    return (
      <div className={styles}>
        <section>
          <h4>Sound</h4>
          <form>
            <div className="form-check">
              <label className="form-check-label" htmlFor="sound-control">
                <input id="sound-control" onChange={this.handleSoundToggle.bind(this)} className="form-check-input" type="checkbox" checked={this.props.soundIsEnabled} />
                Sound
              </label>
            </div>
          </form>
        </section>
        <section>
          <h4 className='mb-3'>This room</h4>
          <RoomLink roomId={this.props.roomId} />
        </section>
        <section>
          <h4>Room Ownership</h4>
          <p>The person who created the room is the room owner and has special privileges, like the ability to lock and unlock the room.
          If the owner leaves the room, the second person to join assumes ownership. If they leave, the third person becomes owner, and so on.
          The room owner has a star icon next to their username in the participants dropdown.
          </p>
        </section>
        <section>
          <h4>Lock Room</h4>
          <p>If you are the room owner, you can lock and unlock the room by clicking the lock icon in the nav bar. When a room is locked, no other participants will be able to join.</p>
        </section>
        <section>
          <h4>Slash Commands</h4>
          <p>The following slash commands are available:</p>
          <ul>
            <li>/nick [username] <span className="text-muted">changes username</span></li>
            <li>/me [action] <span className="text-muted">performs an action</span></li>
            <li>/clear <span className="text-muted">clears your message history</span></li>
            <li>/help <span className="text-muted">lists all commands</span></li>
          </ul>
        </section>
      </div>
    )
  }
}

Settings.propTypes = {
  soundIsEnabled: PropTypes.bool.isRequired,
  toggleSoundEnabled: PropTypes.func.isRequired,
  roomId: PropTypes.string.isRequired,
}

export default Settings
