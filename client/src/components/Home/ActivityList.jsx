import React from 'react';
import PropTypes from 'prop-types';
import { defer } from 'lodash';

import ChatInput from '@/components/Chat';
import T from '@/components/T';

import Activity from './Activity';
import styles from './styles.module.scss';

const ActivityList = ({ activities, openModal }) => {
  const [focusChat, setFocusChat] = React.useState(false);
  const [scrolledToBottom, setScrolledToBottom] = React.useState(true);
  const messageStream = React.useRef(null);
  const activitiesList = React.useRef(null);

  React.useEffect(() => {
    const currentMessageStream = messageStream.current;

    // Update scrolledToBottom state if we scroll the activity stream
    const onScroll = () => {
      const messageStreamHeight = messageStream.current.clientHeight;
      const activitiesListHeight = activitiesList.current.clientHeight;

      const bodyRect = document.body.getBoundingClientRect();
      const elemRect = activitiesList.current.getBoundingClientRect();
      const offset = elemRect.top - bodyRect.top;
      const activitiesListYPos = offset;

      const newScrolledToBottom = activitiesListHeight + (activitiesListYPos - 60) <= messageStreamHeight;
      if (newScrolledToBottom) {
        if (!scrolledToBottom) {
          setScrolledToBottom(true);
        }
      } else if (scrolledToBottom) {
        setScrolledToBottom(false);
      }
    };

    currentMessageStream.addEventListener('scroll', onScroll);
    return () => {
      // Unbind event if component unmounted
      currentMessageStream.removeEventListener('scroll', onScroll);
    };
  }, [scrolledToBottom]);

  const scrollToBottomIfShould = React.useCallback(() => {
    if (scrolledToBottom) {
      messageStream.current.scrollTop = messageStream.current.scrollHeight;
    }
  }, [scrolledToBottom]);

  React.useEffect(() => {
    scrollToBottomIfShould(); // Only if activities.length bigger
  }, [scrollToBottomIfShould, activities]);

  const scrollToBottom = React.useCallback(() => {
    messageStream.current.scrollTop = messageStream.current.scrollHeight;
    setScrolledToBottom(true);
  }, []);

  const handleChatClick = () => {
    setFocusChat(true);
    defer(() => setFocusChat(false));
  };

  return (
    <div className="main-chat">
      <div onClick={handleChatClick} className="message-stream h-100" ref={messageStream} data-testid="main-div">
        <ul className="plain" ref={activitiesList}>
          <li>
            <p className={styles.tos}>
              <button className="btn btn-link" onClick={() => openModal('About')}>
                {' '}
                <T path="agreement" />
              </button>
            </p>
          </li>
          {activities.map((activity, index) => (
            <li key={index} className={`activity-item ${activity.type}`}>
              <Activity activity={activity} scrollToBottom={scrollToBottomIfShould} />
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-container">
        <ChatInput scrollToBottom={scrollToBottom} focusChat={focusChat} />
      </div>
    </div>
  );
};

ActivityList.propTypes = {
  activities: PropTypes.array.isRequired,
  openModal: PropTypes.func.isRequired,
};

export default ActivityList;
