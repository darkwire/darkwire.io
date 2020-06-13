import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ActivityList from './ActivityList';
import { Provider } from 'react-redux';
import configureStore from 'store';

const store = configureStore();

jest.useFakeTimers();

describe('ActivityList component', () => {
  it('should display', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <ActivityList openModal={jest.fn()} activities={[]} />
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
        <ActivityList openModal={jest.fn()} activities={activities} />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show About modal', async () => {
    const mockOpenModal = jest.fn();

    const { getByText } = render(
      <Provider store={store}>
        <ActivityList openModal={mockOpenModal} activities={[]} />
      </Provider>,
    );

    fireEvent.click(getByText('By using Darkwire, you are agreeing to our Acceptable Use Policy and Terms of Service'));
    jest.runAllTimers();

    expect(mockOpenModal.mock.calls[0][0]).toBe('About');
    jest.runAllTimers();
  });

  it('should focus chat', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ActivityList openModal={jest.fn()} activities={[]} />
      </Provider>,
    );
    fireEvent.click(getByTestId('main-div'));
    jest.runAllTimers();
  });

  it('should scroll to bottom on new message if not scrolled', () => {
    jest.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValueOnce(400).mockReturnValueOnce(200);

    Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValueOnce({ top: 0 })
      .mockReturnValueOnce({ top: 261 });

    jest.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(42);
    const mockScrollTop = jest.spyOn(Element.prototype, 'scrollTop', 'set');

    const { rerender, getByTestId } = render(
      <Provider store={store}>
        <ActivityList openModal={jest.fn()} activities={[]} />
      </Provider>,
    );

    rerender(
      <Provider store={store}>
        <ActivityList
          openModal={jest.fn()}
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

    jest.runAllTimers();

    expect(mockScrollTop).toHaveBeenCalledTimes(2);
    expect(mockScrollTop).toHaveBeenLastCalledWith(42);

    fireEvent.scroll(getByTestId('main-div'));

    rerender(
      <Provider store={store}>
        <ActivityList
          openModal={jest.fn()}
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
