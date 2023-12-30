import PropTypes from 'prop-types';

import RoomLink from '@/components/RoomLink';
import T from '@/components/T';

import classes from './styles.module.scss';

const Settings = ({
  soundIsEnabled,
  persistenceIsEnabled,
  toggleSoundEnabled,
  notificationIsEnabled,
  notificationIsAllowed,
  toggleNotificationEnabled,
  toggleNotificationAllowed,
  togglePersistenceEnabled,
  roomId,
  setLanguage,
  language,
  translations,
}) => {
  const handleSoundToggle = () => {
    toggleSoundEnabled(!soundIsEnabled);
  };

  const handlePersistenceToggle = () => {
    togglePersistenceEnabled(!persistenceIsEnabled);
  };

  const handleNotificationToggle = () => {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        toggleNotificationEnabled(!notificationIsEnabled);
        toggleNotificationAllowed(true);
      }
      if (permission === 'denied') {
        toggleNotificationAllowed(false);
      }
    });
  };

  const handleLanguageChange = evt => {
    setLanguage(evt.target.value);
  };

  return (
    <div className={classes.styles}>
      <section>
        <h4>
          <T path="newMessageNotification" />
        </h4>
        <form>
          <div className="form-check">
            <label className="form-check-label" htmlFor="sound-control">
              <input
                id="sound-control"
                onChange={handleSoundToggle}
                className="form-check-input"
                type="checkbox"
                checked={soundIsEnabled}
              />
              <T path="sound" />
            </label>
          </div>
          <div className="form-check">
            <label className="form-check-label" htmlFor="notif-control">
              {notificationIsAllowed !== false && (
                <>
                  <input
                    id="notif-control"
                    onChange={handleNotificationToggle}
                    className="form-check-input"
                    type="checkbox"
                    checked={notificationIsEnabled}
                    disabled={notificationIsAllowed === false} // Important to keep '=== false' here
                  />
                  <T path="desktopNotification" />
                </>
              )}
              {notificationIsAllowed === false && <T path="desktopNotificationBlocked" />}
            </label>
          </div>
          <div className="form-check">
            <label className="form-check-label" htmlFor="persistence-control">
              <input
                id="persistence-control"
                onChange={handlePersistenceToggle}
                className="form-check-input"
                type="checkbox"
                checked={persistenceIsEnabled}
              />
              <T path="persistence" />
            </label>
          </div>
        </form>
      </section>

      <section>
        <h4 className="mb-3">
          <T path="copyRoomHeader" />
        </h4>
        <RoomLink roomId={roomId} translations={translations} />
      </section>

      <section>
        <h4 className="mb-3">
          <T path="languageDropdownHeader" />
        </h4>
        <p>
          <a
            href="https://github.com/darkwire/darkwire.io/blob/master/client/README.md#translations"
            rel="noopener noreferrer"
            target="_blank"
          >
            <T path="helpTranslate" />
          </a>
        </p>
        <div className="form-group">
          <select value={language} className="form-control" onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="oc">Occitan</option>
            <option value="de">Deutsch</option>
            <option value="esAR">Español (Argentina)</option>
            <option value="nl">Nederlands</option>
            <option value="it">Italiano</option>
            <option value="ru">Русский</option>
            <option value="pl">Polish</option>
            <option value="zhCN">中文</option>
            <option value="ja">日本語</option>
            <option value="tr">Türkçe</option>
            <option value="ko">한국어</option>
          </select>
        </div>
      </section>

      <section>
        <h4>
          <T path="roomOwnerHeader" />
        </h4>
        <p>
          <T path="roomOwnerText" />
        </p>
      </section>
      <section>
        <h4>
          <T path="lockRoomHeader" />
        </h4>
        <p>
          <T path="lockRoomText" />
        </p>
      </section>
      <section>
        <h4>
          <T path="slashCommandsHeader" />
        </h4>
        <p>
          <T path="slashCommandsText" />
        </p>
        <ul>
          <li>
            /nick [username]{' '}
            <span className="text-muted">
              <T path="slashCommandsBullets.0" />
            </span>
          </li>
          <li>
            /me [action]{' '}
            <span className="text-muted">
              <T path="slashCommandsBullets.1" />
            </span>
          </li>
          <li>
            /clear{' '}
            <span className="text-muted">
              <T path="slashCommandsBullets.2" />
            </span>
          </li>
          <li>
            /help{' '}
            <span className="text-muted">
              <T path="slashCommandsBullets.3" />
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
};

Settings.propTypes = {
  soundIsEnabled: PropTypes.bool.isRequired,
  persistenceIsEnabled: PropTypes.bool.isRequired,
  toggleSoundEnabled: PropTypes.func.isRequired,
  togglePersistenceEnabled: PropTypes.func.isRequired,
  notificationIsEnabled: PropTypes.bool.isRequired,
  notificationIsAllowed: PropTypes.bool,
  toggleNotificationEnabled: PropTypes.func.isRequired,
  toggleNotificationAllowed: PropTypes.func.isRequired,
  roomId: PropTypes.string.isRequired,
  setLanguage: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired,
};

export default Settings;
