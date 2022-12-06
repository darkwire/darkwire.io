import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';

import configureStore from '@/store';

import ActivityList from './ActivityList';

const store = configureStore();

vi.useFakeTimers();

describe('ActivityList component', () => {
  it('should display', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <ActivityList openModal={vi.fn()} activities={[]} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display with activities', () => {
    const activities = [
      {
        type: 'TEXT_MESSAGE',
        username: 'alice',
        timestamp: new Date('2020-03-14T11:01:58.135Z').valueOf(),
        text: 'Hi!',
      },
      {
        type: 'USER_ENTER',
        username: 'alice',
      },
      {
        type: 'CHANGE_USERNAME',
        currentUsername: 'alice',
        newUsername: 'alicette',
      },
    ];
    const { asFragment } = render(
      <Provider store={store}>
        <ActivityList openModal={vi.fn()} activities={activities} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show About modal', async () => {
    const mockOpenModal = vi.fn();

    const { getByText } = render(
      <Provider store={store}>
        <ActivityList openModal={mockOpenModal} activities={[]} />
      </Provider>,
    );

    fireEvent.click(getByText('By using Darkwire, you are agreeing to our Acceptable Use Policy and Terms of Service'));
    vi.runAllTimers();

    expect(mockOpenModal.mock.calls[0][0]).toBe('About');
    vi.runAllTimers();
  });

  it('should focus chat', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ActivityList openModal={vi.fn()} activities={[]} />
      </Provider>,
    );
    fireEvent.click(getByTestId('main-div'));
    vi.runAllTimers();
  });

  it('should scroll to bottom on new message if not scrolled', () => {
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValueOnce(400).mockReturnValueOnce(200);

    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValueOnce({ top: 0 }).mockReturnValueOnce({ top: 261 });

    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(42);
    const mockScrollTop = vi.spyOn(Element.prototype, 'scrollTop', 'set');

    const { rerender, getByTestId } = render(
      <Provider store={store}>
        <ActivityList openModal={vi.fn()} activities={[]} />
      </Provider>,
    );

    rerender(
      <Provider store={store}>
        <ActivityList
          openModal={vi.fn()}
          activities={[
            {
              type: 'TEXT_MESSAGE',
              username: 'alice',
              timestamp: new Date('2020-03-14T11:01:58.135Z').valueOf(),
              text: 'Hi!',
            },
          ]}
        />
      </Provider>,
    );

    vi.runAllTimers();

    expect(mockScrollTop).toHaveBeenCalledTimes(2);
    expect(mockScrollTop).toHaveBeenLastCalledWith(42);

    fireEvent.scroll(getByTestId('main-div'));

    rerender(
      <Provider store={store}>
        <ActivityList
          openModal={vi.fn()}
          activities={[
            {
              type: 'TEXT_MESSAGE',
              username: 'alice',
              timestamp: new Date('2020-03-14T11:01:58.135Z').valueOf(),
              text: 'Hi!',
            },
            {
              type: 'TEXT_MESSAGE',
              username: 'alice',
              timestamp: new Date('2020-03-14T11:01:59.135Z').valueOf(),
              text: 'Hi! every body',
            },
          ]}
        />
      </Provider>,
    );

    expect(mockScrollTop).toHaveBeenCalledTimes(2);
  });
});
