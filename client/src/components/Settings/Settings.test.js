import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Settings from '.';

const mockTranslations = {
  sound: 'soundCheck',
};

jest.mock('components/T', () => {
  return jest.fn().mockImplementation(({ path }) => {
    return mockTranslations[path] || 'default';
  });
});

// To avoid missing provider
jest.mock('components/T');
jest.mock('components/RoomLink');

describe('Settings component', () => {
  it('should display', async () => {
    const { asFragment } = render(
      <Settings
        soundIsEnabled={true}
        toggleSoundEnabled={() => {}}
        roomId="roomId"
        setLanguage={() => {}}
        translations={mockTranslations}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should toggle sound', async () => {
    const toggleSound = jest.fn();
    const { getAllByText } = render(
      <Settings
        soundIsEnabled={true}
        toggleSoundEnabled={toggleSound}
        roomId="roomId"
        setLanguage={() => {}}
        translations={mockTranslations}
      />,
    );

    //console.log(getAllByText(mockTranslations.sound)[1]);
    fireEvent.click(getAllByText(mockTranslations.sound)[1]);

    expect(toggleSound).toHaveBeenCalledWith(false);
  });

  it('should change lang', async () => {
    const changeLang = jest.fn();

    const { getByDisplayValue } = render(
      <Settings
        soundIsEnabled={true}
        toggleSoundEnabled={() => {}}
        roomId="roomId"
        setLanguage={changeLang}
        translations={{}}
      />,
    );

    fireEvent.change(getByDisplayValue('English'), { target: { value: 'de' } });

    expect(changeLang).toHaveBeenCalledWith('de');
  });
});
