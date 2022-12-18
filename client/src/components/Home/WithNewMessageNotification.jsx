import React from 'react';
import { connect } from 'react-redux';
import Tinycon from 'tinycon';

import { notify, beep } from '@/utils/notifications';
import { toggleNotificationAllowed } from '@/actions';

const mapStateToProps = state => {
  return {
    activities: state.activities.items,
    unreadMessageCount: state.app.unreadMessageCount,
    windowIsFocused: state.app.windowIsFocused,
    soundIsEnabled: state.app.soundIsEnabled,
    notificationIsEnabled: state.app.notificationIsEnabled,
    notificationIsAllowed: state.app.notificationIsAllowed,
    room: state.room,
  };
};

const mapDispatchToProps = {
  toggleNotificationAllowed,
};

const WithNewMessageNotification = ({
  room: { id: roomId },
  activities,
  notificationIsEnabled,
  notificationIsAllowed,
  soundIsEnabled,
  unreadMessageCount,
  windowIsFocused,
  toggleNotificationAllowed,
  children,
}) => {
  const [lastMessage, setLastMessage] = React.useState(null);
  const [lastUnreadMessageCount, setLastUnreadMessageCount] = React.useState(0);

  React.useEffect(() => {
    if (activities.length === 0) {
      return;
    }
    const currentLastMessage = activities[activities.length - 1];
    const { username, type, text, fileName, locked, newUsername, currentUsername, action } = currentLastMessage;

    if (currentLastMessage !== lastMessage && !windowIsFocused) {
      if (notificationIsAllowed && notificationIsEnabled) {
        // Generate the proper notification according to the message type
        switch (type) {
          case 'USER_ENTER':
            notify(`User ${username} joined`);
            break;
          case 'USER_EXIT':
            notify(`User ${username} left`);
            break;
          case 'RECEIVE_FILE':
            notify(`${username} sent file <${fileName}>`);
            break;
          case 'TEXT_MESSAGE':
            notify(`${username} said:`, text);
            break;
          case 'USER_ACTION':
            notify(`${username} ${action}`);
            break;
          case 'CHANGE_USERNAME':
            notify(`${currentUsername} changed their name to ${newUsername}`);
            break;
          case 'TOGGLE_LOCK_ROOM':
            if (locked) {
              notify(`Room ${roomId} is now locked`);
            } else {
              notify(`Room ${roomId} is now unlocked`);
            }
            break;
          default:
            break;
        }
      }
      if (soundIsEnabled) beep.play();
    }

    setLastMessage(currentLastMessage);

    if (unreadMessageCount !== lastUnreadMessageCount) {
      setLastUnreadMessageCount(unreadMessageCount);
      Tinycon.setBubble(unreadMessageCount);
    }
  }, [
    activities,
    lastMessage,
    lastUnreadMessageCount,
    notificationIsAllowed,
    notificationIsEnabled,
    roomId,
    soundIsEnabled,
    unreadMessageCount,
    windowIsFocused,
  ]);

  React.useEffect(() => {
    switch (Notification.permission) {
      case 'granted':
        toggleNotificationAllowed(true);
        break;
      case 'denied':
        toggleNotificationAllowed(false);
        break;
      default:
        toggleNotificationAllowed(null);
    }
  }, [toggleNotificationAllowed]);

  return <>{children}</>;
};

const ConnectedWithNewMessageNotification = connect(mapStateToProps, mapDispatchToProps)(WithNewMessageNotification);

export default ConnectedWithNewMessageNotification;
