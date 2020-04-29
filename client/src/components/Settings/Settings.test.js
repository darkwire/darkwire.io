import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'store';

import Settings from '.';

const store = configureStore();

const mockTranslations = {
  sound: 'soundCheck',
};

jest.mock('components/RoomLink');

describe('Settings component', () => {
  it('should display', async () => {
    const { asFragment } = render(
      <Provider store={store}>
        <Settings
          soundIsEnabled={true}
          toggleSoundEnabled={() => {}}
          notificationIsEnabled={true}
          toggleNotificationEnabled={() => {}}
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
          toggleNotificationEnabled={() => {}}
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
    const toggleNotifications = jest.fn();
    const { getByText } = render(
      <Provider store={store}>
        <Settings
          soundIsEnabled={true}
          toggleSoundEnabled={() => {}}
          notificationIsEnabled={true}
          toggleNotificationEnabled={toggleNotifications}
          roomId="roomId"
          setLanguage={() => {}}
          translations={{}}
        />
      </Provider>,
    );

    fireEvent.click(getByText('Desktop Notification'));

    expect(toggleNotifications).toHaveBeenCalledWith(false);
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
