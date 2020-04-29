import React, { Component } from 'react';
import { connect } from 'react-redux';
import { notify, beep } from 'utils/notifications';
import Tinycon from 'tinycon';

const mapStateToProps = state => {
  return {
    activities: state.activities.items,
    unreadMessageCount: state.app.unreadMessageCount,
    windowIsFocused: state.app.windowIsFocused,
    soundIsEnabled: state.app.soundIsEnabled,
    notificationIsEnabled: state.app.notificationIsEnabled,
    room: state.room,
  };
};

const WithNewMessageNotification = WrappedComponent => {
  return connect(mapStateToProps)(
    class WithNotificationHOC extends Component {
      state = { lastMessage: null, unreadMessageCount: 0 };

      static getDerivedStateFromProps(nextProps, prevState) {
        const {
          room: { id: roomId },
          activities,
          notificationIsEnabled,
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
          if (notificationIsEnabled) notify(title, text);
          if (soundIsEnabled) beep.play();
        }

        if (unreadMessageCount !== prevState.unreadMessageCount) {
          Tinycon.setBubble(unreadMessageCount);
        }

        return { lastMessage, unreadMessageCount };
      }

      render() {
        // Filter props
        const {
          room,
          activities,
          notificationIsEnabled,
          soundIsEnabled,
          unreadMessageCount,
          windowIsFocused,
          ...rest
        } = this.props;
        return <WrappedComponent {...rest} />;
      }
    },
  );
};

export default WithNewMessageNotification;
