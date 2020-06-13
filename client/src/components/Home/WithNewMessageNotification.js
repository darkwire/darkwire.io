import React, { Component } from 'react';
import { connect } from 'react-redux';
import { notify, beep } from 'utils/notifications';
import Tinycon from 'tinycon';
import { toggleNotificationAllowed, toggleNotificationEnabled } from 'actions';

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
  toggleNotificationEnabled
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
        const { username, text } = lastMessage;

        if (lastMessage !== prevState.lastMessage && !windowIsFocused) {
          const title = `Message from ${username} (${roomId})`;
          if (notificationIsAllowed && notificationIsEnabled) notify(title, text);
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
            this.props.toggleNotificationEnabled(true);
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
