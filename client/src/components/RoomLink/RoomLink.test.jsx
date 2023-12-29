import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RoomLink from '.';
import mock$ from 'jquery';
import { describe, it, expect, vi, afterEach } from 'vitest';

const mockTooltip = vi.fn().mockImplementation(param => {});

vi.mock('jquery', () => {
  return {
    default: vi.fn().mockImplementation(param => {
      if (typeof param === 'function') {
        param();
      }
      return {
        tooltip: mockTooltip,
      };
    }),
  };
});

vi.useFakeTimers();

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
    document.execCommand = vi.fn(() => true);

    const { getByTitle } = render(<RoomLink roomId="roomId" translations={mockTranslations} />);

    await fireEvent.click(getByTitle(mockTranslations.copyButtonTooltip));

    expect(document.execCommand).toHaveBeenLastCalledWith('copy');
    expect(mock$).toHaveBeenCalledTimes(4);
    expect(mock$).toHaveBeenLastCalledWith('.copy-room');
    expect(mockTooltip).toHaveBeenLastCalledWith('show');

    // Wait for tooltip to close
    vi.runAllTimers();

    expect(mock$).toHaveBeenCalledTimes(6);
    expect(mock$).toHaveBeenLastCalledWith('.copy-room');
    expect(mockTooltip).toHaveBeenLastCalledWith('hide');
  });
});
