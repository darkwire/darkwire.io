import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import About from '.';
import fetchMock from 'jest-fetch-mock';

jest.useFakeTimers();

// Mock Api generator

jest.mock('../../api/generator', () => {
  return path => {
    return `http://fakedomain/${path}`;
  };
});

describe('About component', () => {
  afterEach(() => {
    fetchMock.resetMocks();
  });

  it('should display', async () => {
    const { asFragment } = render(<About roomId={'test'} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should report abuse', async () => {
    const { getByText, queryByText } = render(<About roomId={'test'} />);

    expect(queryByText('Thank you!')).not.toBeInTheDocument();

    fireEvent.click(getByText('Submit'));

    expect(fetchMock).toHaveBeenCalledWith('http://fakedomain/abuse/test', { method: 'POST' });

    expect(getByText('Thank you!')).toBeInTheDocument();
  });

  it('should change room id', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<About roomId={'test'} />);

    expect(queryByText('Thank you!')).not.toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('Room ID'), { target: { value: 'newRoomName' } });

    jest.runAllTimers();

    fireEvent.click(getByText('Submit'));

    expect(fetchMock).toHaveBeenLastCalledWith('http://fakedomain/abuse/newRoomName', { method: 'POST' });
  });
});
