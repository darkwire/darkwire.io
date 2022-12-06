import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';

import Activity from './Activity';
import configureStore from '@/store';

const store = configureStore();

describe('Activity component', () => {
  it('should display', () => {
    const activity = {
      type: '',
    };
    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display TEXT_MESSAGE', () => {
    const activity = {
      type: 'TEXT_MESSAGE',
      username: 'alice',
      timestamp: new Date('2020-03-14T11:01:58.135Z').valueOf(),
      text: 'Hi!',
    };
    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display USER_ENTER', () => {
    const activity = {
      type: 'USER_ENTER',
      username: 'alice',
    };
    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display USER_EXIT', () => {
    const activity = {
      type: 'USER_EXIT',
      username: 'alice',
    };
    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display TOGGLE_LOCK_ROOM', () => {
    const activity = {
      type: 'TOGGLE_LOCK_ROOM',
      locked: true,
      username: 'alice',
    };
    const { asFragment, rerender } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();

    activity.locked = false;

    rerender(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display NOTICE', () => {
    const activity = {
      type: 'NOTICE',
      message: 'Hello world!',
    };
    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display CHANGE_USERNAME', () => {
    const activity = {
      type: 'CHANGE_USERNAME',
      currentUsername: 'alice',
      newUsername: 'alicette',
    };
    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display USER_ACTION', () => {
    const activity = {
      type: 'USER_ACTION',
      username: 'alice',
      action: 'did right!',
    };
    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display RECEIVE_FILE', () => {
    const activity = {
      type: 'RECEIVE_FILE',
      username: 'alice',
      fileName: 'alice.pdf',
      encodedFile: 'dGV4dGZpbGU=',
      fileType: 'text/plain',
    };
    global.URL.createObjectURL = vi.fn(data => `url:${data}`);

    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display RECEIVE_FILE with image', () => {
    global.URL.createObjectURL = vi.fn(data => `url:${data}`);

    const mockScrollToBottom = vi.fn();

    const activity = {
      type: 'RECEIVE_FILE',
      username: 'alice',
      fileName: 'alice.jpg',
      encodedFile: 'dGV4dGZpbGU=',
      fileType: 'image/jpg',
    };

    const { asFragment, getByAltText } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={mockScrollToBottom} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();

    const image = getByAltText('alice.jpg from alice');
    fireEvent.load(image);
    expect(mockScrollToBottom).toHaveBeenCalled();
  });

  it('should display SEND_FILE', () => {
    global.URL.createObjectURL = vi.fn(data => `url:${data}`);
    const activity = {
      type: 'SEND_FILE',
      username: 'alice',
      fileName: 'alice.pdf',
      encodedFile: 'dGV4dGZpbGU=',
      fileType: 'text/plain',
    };

    const { asFragment } = render(
      <Provider store={store}>
        <Activity activity={activity} scrollToBottom={vi.fn()} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
