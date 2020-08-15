import React, { Component } from 'react';
import { connect } from 'react-redux';
import Tinycon from 'tinycon';

import { notify, beep } from '@/utils/notifications';
import { toggleNotificationAllowed, toggleNotificationEnabled } from '@/actions';

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
  toggleNotificationEnabled,
};

const WithNewMessageNotification = WrappedComponent => {
  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(
    class WithNotificationHOC extends Component {
      state = { lastMessage: null, unreadMessageCount: 0 };

      static getDerivedStateFromProps(nextProps, prevState) {
        const {
          room: { id: roomId },
          activities,
          notificationIsEnabled,
          notificationIsAllowed,
          soundIsEnabled,
          unreadMessageCount,
          windowIsFocused,
        } = nextProps;

        if (activities.length === 0) {
          return null;
        }

        const lastMessage = activities[activities.length - 1];
        const { username, type, text, fileName, locked, newUsername, currentUsername, action } = lastMessage;

        if (lastMessage !== prevState.lastMessage && !windowIsFocused) {
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

        if (unreadMessageCount !== prevState.unreadMessageCount) {
          Tinycon.setBubble(unreadMessageCount);
        }

        return { lastMessage, unreadMessageCount };
      }

      componentDidMount() {
        switch (Notification.permission) {
          case 'granted':
            this.props.toggleNotificationAllowed(true);
            break;
          case 'denied':
            this.props.toggleNotificationAllowed(false);
            break;
          default:
            this.props.toggleNotificationAllowed(null);
        }
      }

      render() {
        // Filter props
        const {
          room,
          activities,
          notificationIsEnabled,
          motificationIsAllowed,
          soundIsEnabled,
          unreadMessageCount,
          windowIsFocused,
          toggleNotificationAllowed,
          toggleNotificationnEnabled,
          ...rest
        } = this.props;
        return <WrappedComponent {...rest} />;
      }
    },
  );
};

export default WithNewMessageNotification;
