import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ChatInput from 'components/Chat'
import { defer } from 'lodash'
import Activity from './Activity'

import T from 'components/T'

import styles from './styles.module.scss'

class ActivityList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      zoomableImages: [],
      focusChat: false,
    }
  }

  componentDidMount() {
    this.bindEvents()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activities.length < this.props.activities.length) {
      this.scrollToBottomIfShould()
    }
  }

  onScroll() {
    const messageStreamHeight = this.messageStream.clientHeight
    const activitiesListHeight = this.activitiesList.clientHeight

    const bodyRect = document.body.getBoundingClientRect()
    const elemRect = this.activitiesList.getBoundingClientRect()
    const offset = elemRect.top - bodyRect.top
    const activitiesListYPos = offset

    const scrolledToBottom = (activitiesListHeight + (activitiesListYPos - 60)) <= messageStreamHeight
    if (scrolledToBottom) {
      if (!this.props.scrolledToBottom) {
        this.props.setScrolledToBottom(true)
      }
    } else if (this.props.scrolledToBottom) {
      this.props.setScrolledToBottom(false)
    }
  }

  scrollToBottomIfShould() {
    if (this.props.scrolledToBottom) {
      setTimeout(() => {
        this.messageStream.scrollTop = this.messageStream.scrollHeight
      }, 0)
    }
  }

  scrollToBottom() {
    this.messageStream.scrollTop = this.messageStream.scrollHeight
    this.props.setScrolledToBottom(true)
  }

  bindEvents() {
    this.messageStream.addEventListener('scroll', this.onScroll.bind(this))
  }

  handleChatClick() {
    this.setState({ focusChat: true })
    defer(() => this.setState({ focusChat: false }))
  }

  render() {
    return (
      <div className="main-chat">
        <div onClick={this.handleChatClick.bind(this)} className="message-stream h-100" ref={el => this.messageStream = el}>
          <ul className="plain" ref={el => this.activitiesList = el}>
            <li><p className={styles.tos}><button className='btn btn-link' onClick={this.props.openModal.bind(this, 'About')}> <T path='agreement'/></button></p></li>
            {this.props.activities.map((activity, index) => (
            <li key={index} className={`activity-item ${activity.type}`}>
                <Activity activity={activity} scrollToBottom={this.scrollToBottomIfShould.bind(this)} />
            </li>
            ))}
          </ul>
          </div>
          <div className="chat-container">
          <ChatInput scrollToBottom={this.scrollToBottom.bind(this)} focusChat={this.state.focusChat} />
        </div>
      </div>
    )
  }
}

ActivityList.propTypes = {
  activities: PropTypes.array.isRequired,
  openModal: PropTypes.func.isRequired,
  setScrolledToBottom: PropTypes.func.isRequired,
  scrolledToBottom: PropTypes.bool.isRequired,
}

export default ActivityList;
