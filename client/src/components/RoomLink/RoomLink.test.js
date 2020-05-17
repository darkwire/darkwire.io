import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RoomLink from '.';
import mock$ from 'jquery';

const mockTooltip = jest.fn().mockImplementation(param => {
  // console.log('tooltip', param);
});

jest.mock('jquery', () => {
  return jest.fn().mockImplementation(param => {
    // console.log('$', param);
    if (typeof param === 'function') {
      param();
    }
    return {
      tooltip: mockTooltip,
    };
  });
});

jest.useFakeTimers();

const mockTranslations = {
  copyButtonTooltip: 'copyButton',
};

describe('RoomLink', () => {
  afterEach(() => {
    mock$.mockClear();
  });

  it('should display', async () => {
    const { asFragment, unmount } = render(<RoomLink roomId="roomId" translations={mockTranslations} />);

    expect(asFragment()).toMatchSnapshot();

    expect(mock$).toHaveBeenLastCalledWith('.copy-room');
    expect(mockTooltip).toHaveBeenLastCalledWith({ trigger: 'manual' });
    mock$.mockClear();

    unmount();

    expect(mock$).toHaveBeenLastCalledWith('.copy-room');
    expect(mockTooltip).toHaveBeenLastCalledWith('hide');
  });

  it('should copy link', async () => {
    // Mock execCommand for paste
    document.execCommand = jest.fn(() => true);

    const { getByTitle } = render(<RoomLink roomId="roomId" translations={mockTranslations} />);

    fireEvent.click(getByTitle(mockTranslations.copyButtonTooltip));

    expect(document.execCommand).toHaveBeenLastCalledWith('copy');
    expect(mock$).toHaveBeenCalledTimes(4);
    expect(mock$).toHaveBeenLastCalledWith('.copy-room');
    expect(mockTooltip).toHaveBeenLastCalledWith('show');

    // Wait for tooltip to close
    jest.runAllTimers();

    expect(mock$).toHaveBeenCalledTimes(6);
    expect(mock$).toHaveBeenLastCalledWith('.copy-room');
    expect(mockTooltip).toHaveBeenLastCalledWith('hide');
  });
});
