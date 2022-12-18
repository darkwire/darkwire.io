import { render, fireEvent } from '@testing-library/react';
import RoomLink from '.';
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react-dom/test-utils';

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
  it('should display', async () => {
    const { asFragment } = render(<RoomLink roomId="roomId" translations={mockTranslations} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should copy link', async () => {
    const mockClipboardWriteTest = vi.fn();
    navigator.clipboard = { writeText: mockClipboardWriteTest };

    const { getByTestId, queryByText, getByText } = render(
      <RoomLink roomId="roomId" translations={mockTranslations} />,
    );

    await act(async () => {
      await fireEvent.click(getByTestId('copy-room-button'));
    });

    expect(mockClipboardWriteTest).toHaveBeenLastCalledWith('http://localhost:3000/roomId');

    await getByText(mockTranslations.copyButtonTooltip);

    // Wait tooltip closing
    await act(() => vi.runAllTimers());

    expect(queryByText('Copied')).not.toBeInTheDocument();
  });
});
