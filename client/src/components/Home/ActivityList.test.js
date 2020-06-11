import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ActivityList from './ActivityList';
import { Provider } from 'react-redux';
import configureStore from 'store';

const store = configureStore();

jest.useFakeTimers();

describe('ActivityList component', () => {
  it('should display', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <ActivityList openModal={jest.fn()} activities={[]} setScrolledToBottom={jest.fn()} scrolledToBottom />
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
        <ActivityList openModal={jest.fn()} activities={activities} setScrolledToBottom={jest.fn()} scrolledToBottom />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show About modal', async () => {
    const mockOpenModal = jest.fn();

    const { getByText } = render(
      <Provider store={store}>
        <ActivityList openModal={mockOpenModal} activities={[]} setScrolledToBottom={jest.fn()} scrolledToBottom />
      </Provider>,
    );

    fireEvent.click(getByText('By using Darkwire, you are agreeing to our Acceptable Use Policy and Terms of Service'));
    jest.runAllTimers();

    expect(mockOpenModal.mock.calls[0][0]).toBe('About');
  });

  it('should focus chat', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ActivityList openModal={jest.fn()} activities={[]} setScrolledToBottom={jest.fn()} scrolledToBottom />
      </Provider>,
    );
    fireEvent.click(getByTestId('main-div'));
    jest.runAllTimers();
  });

  it('should handle scroll', () => {
    const mockSetScrollToBottom = jest.fn();
    jest
      .spyOn(Element.prototype, 'clientHeight', 'get')
      .mockReturnValueOnce(400)
      .mockReturnValueOnce(200)
      .mockReturnValueOnce(400)
      .mockReturnValueOnce(200);

    Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValueOnce({ top: 0 })
      .mockReturnValueOnce({ top: 60 })
      .mockReturnValueOnce({ top: 0 })
      .mockReturnValueOnce({ top: 261 });

    const { getByTestId, rerender } = render(
      <Provider store={store}>
        <ActivityList
          openModal={jest.fn()}
          activities={[]}
          setScrolledToBottom={mockSetScrollToBottom}
          scrolledToBottom={false}
        />
      </Provider>,
    );
    fireEvent.scroll(getByTestId('main-div'));

    expect(mockSetScrollToBottom).toHaveBeenLastCalledWith(true);

    rerender(
      <Provider store={store}>
        <ActivityList
          openModal={jest.fn()}
          activities={[]}
          setScrolledToBottom={mockSetScrollToBottom}
          scrolledToBottom={true}
        />
      </Provider>,
    );

    fireEvent.scroll(getByTestId('main-div'));

    expect(mockSetScrollToBottom).toHaveBeenCalledTimes(2);
    expect(mockSetScrollToBottom).toHaveBeenLastCalledWith(false);
  });

  it('should scroll to bottom on new message', () => {
    const mockSetScrollToBottom = jest.fn();

    jest.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(42);
    const mockScrollTop = jest.spyOn(Element.prototype, 'scrollTop', 'set');

    const { rerender } = render(
      <Provider store={store}>
        <ActivityList
          openModal={jest.fn()}
          activities={[]}
          setScrolledToBottom={mockSetScrollToBottom}
          scrolledToBottom={true}
        />
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
          setScrolledToBottom={mockSetScrollToBottom}
          scrolledToBottom={true}
        />
      </Provider>,
    );

    jest.runAllTimers();

    expect(mockScrollTop).toHaveBeenLastCalledWith(42);
  });
});
