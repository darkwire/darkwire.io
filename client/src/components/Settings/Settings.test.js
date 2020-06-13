import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'store';

import Settings from '.';

const store = configureStore();

const mockTranslations = {
  sound: 'soundCheck',
};

jest.useFakeTimers();

jest.mock('components/RoomLink');

describe('Settings component', () => {
  it('should display', async () => {
    const { asFragment, rerender } = render(
      <Provider store={store}>
        <Settings
          soundIsEnabled={true}
          toggleSoundEnabled={() => {}}
          notificationIsEnabled={true}
          toggleNotificationEnabled={() => {}}
          toggleNotificationAllowed={jest.fn()}
          roomId="roomId"
          setLanguage={() => {}}
          translations={{}}
        />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();

    rerender(
      <Provider store={store}>
        <Settings
          soundIsEnabled={true}
          toggleSoundEnabled={() => {}}
          notificationIsEnabled={true}
          notificationIsAllowed={false}
          toggleNotificationEnabled={() => {}}
          toggleNotificationAllowed={jest.fn()}
          roomId="roomId"
          setLanguage={() => {}}
          translations={{}}
        />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should toggle sound', async () => {
    const toggleSound = jest.fn();
    const { getByText } = render(
      <Provider store={store}>
        <Settings
          soundIsEnabled={true}
          toggleSoundEnabled={toggleSound}
          notificationIsEnabled={true}
          notificationIsAllowed={true}
          toggleNotificationEnabled={() => {}}
          toggleNotificationAllowed={jest.fn()}
          roomId="roomId"
          setLanguage={() => {}}
          translations={{}}
        />
      </Provider>,
    );

    //console.log(getAllByText(mockTranslations.sound)[1]);
    fireEvent.click(getByText('Sound'));

    expect(toggleSound).toHaveBeenCalledWith(false);
  });

  it('should toggle notifications', async () => {
    global.Notification = {
      requestPermission: jest.fn().mockResolvedValue('granted'),
    };

    const toggleNotifications = jest.fn();
    const { getByText } = render(
      <Provider store={store}>
        <Settings
          soundIsEnabled={true}
          toggleSoundEnabled={() => {}}
          notificationIsEnabled={true}
          notificationIsAllowed={true}
          toggleNotificationEnabled={toggleNotifications}
          toggleNotificationAllowed={jest.fn()}
          roomId="roomId"
          setLanguage={() => {}}
          translations={{}}
        />
      </Provider>,
    );

    fireEvent.click(getByText('Desktop Notification'));

    jest.runAllTimers();

    delete global.Notification;

    waitFor(() => expect(toggleNotifications).toHaveBeenCalledWith(false));
  });

  it('should not toggle notifications', async () => {
    global.Notification = {
      requestPermission: jest.fn().mockResolvedValue('denied'),
    };

    const toggleNotifications = jest.fn();
    const toggleAllowed = jest.fn();
    const { getByText } = render(
      <Provider store={store}>
        <Settings
          soundIsEnabled={true}
          toggleSoundEnabled={() => {}}
          notificationIsEnabled={true}
          notificationIsAllowed={true}
          toggleNotificationEnabled={toggleNotifications}
          toggleNotificationAllowed={toggleAllowed}
          roomId="roomId"
          setLanguage={() => {}}
          translations={{}}
        />
      </Provider>,
    );

    fireEvent.click(getByText('Desktop Notification'));

    jest.runAllTimers();

    delete global.Notification;

    waitFor(() => expect(toggleAllowed).toHaveBeenCalledWith(false));
    waitFor(() => expect(toggleNotifications).not.toHaveBeenCalled());
  });

  it('should change lang', async () => {
    const changeLang = jest.fn();

    const { getByDisplayValue } = render(
      <Provider store={store}>
        <Settings
          soundIsEnabled={true}
          toggleSoundEnabled={() => {}}
          notificationIsEnabled={true}
          toggleNotificationEnabled={() => {}}
          toggleNotificationAllowed={jest.fn()}
          roomId="roomId"
          setLanguage={changeLang}
          translations={{}}
        />
      </Provider>,
    );

    fireEvent.change(getByDisplayValue('English'), { target: { value: 'de' } });

    expect(changeLang).toHaveBeenCalledWith('de');
  });
});
