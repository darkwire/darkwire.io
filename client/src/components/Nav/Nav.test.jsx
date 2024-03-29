import { render, fireEvent, waitFor } from '@testing-library/react';
import mock$ from 'jquery';
import { test, expect, vi } from 'vitest';
import { act } from 'react-dom/test-utils';

import Nav from '.';

const mockTooltip = vi.fn().mockImplementation(param => {
  // console.log('tooltip', param);
});

const mockCollapse = vi.fn().mockImplementation(param => {
  // console.log('collapse', param);
});

vi.mock('jquery', () => {
  return {
    default: vi.fn().mockImplementation(param => {
      if (typeof param === 'function') {
        param();
      }
      return {
        tooltip: mockTooltip,
        collapse: mockCollapse,
      };
    }),
  };
});

vi.mock('nanoid', () => {
  return {
    nanoid: () => {
      return 'fakeid';
    },
  };
});

const mockClipboardWriteTest = vi.fn();

const mockTranslations = {
  newRoomButton: 'new room',
  settingsButton: 'settings',
  aboutButton: 'about',
};

vi.useFakeTimers();

test('Nav component is displaying', async () => {
  const { asFragment } = render(
    <Nav
      members={[]}
      roomId={'testRoom'}
      userId={'userId__'}
      roomLocked={false}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={true}
      translations={{}}
    />,
  );

  expect(asFragment()).toMatchSnapshot();
});

test('Nav component is displaying with another configuration and can rerender', async () => {
  const { asFragment, rerender } = render(
    <Nav
      members={[
        { id: 'id1', username: 'alan', isOwner: true },
        { id: 'id2', username: 'dan', isOwner: false },
      ]}
      roomId={'testRoom_2'}
      userId={'userId_2'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={false}
      translations={{}}
    />,
  );

  expect(asFragment()).toMatchSnapshot();

  rerender(
    <Nav
      members={[
        { id: 'id1', username: 'alan', isOwner: true },
        { id: 'id2', username: 'dan', isOwner: false },
      ]}
      roomId={'testRoom_3'}
      userId={'userId_3'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={false}
      translations={{}}
    />,
  );

  expect(asFragment()).toMatchSnapshot();
});

test('Can copy room url', async () => {
  navigator.clipboard = { writeText: mockClipboardWriteTest };

  const toggleLockRoom = vi.fn();

  const { getByText, queryByText } = render(
    <Nav
      members={[
        { id: 'id1', username: 'alan', isOwner: true },
        { id: 'id2', username: 'dan', isOwner: false },
      ]}
      roomId={'testRoom'}
      userId={'userId'}
      roomLocked={true}
      toggleLockRoom={toggleLockRoom}
      openModal={() => {}}
      iAmOwner={false}
      translations={{ copyButtonTooltip: 'Copied' }}
    />,
  );

  await act(async () => {
    await fireEvent.click(getByText('/testRoom'));
  });

  expect(mockClipboardWriteTest).toHaveBeenLastCalledWith('http://localhost:3000/testRoom');

  await getByText('Copied');

  // Wait tooltip closing
  await act(() => vi.runAllTimers());

  expect(queryByText('Copied')).not.toBeInTheDocument();
});

test('Can lock/unlock room is room owner only', async () => {
  const toggleLockRoom = vi.fn();

  const { rerender, getByTestId, getByText, queryByText } = render(
    <Nav
      members={[
        { id: 'id1', username: 'alan', isOwner: true },
        { id: 'id2', username: 'dan', isOwner: false },
      ]}
      roomId={'testRoom'}
      userId={'userId'}
      roomLocked={true}
      toggleLockRoom={toggleLockRoom}
      openModal={() => {}}
      iAmOwner={true}
      translations={{}}
    />,
  );

  const toggleLockRoomButton = getByTestId('lock-room-button');

  await fireEvent.click(toggleLockRoomButton);

  expect(toggleLockRoom).toHaveBeenCalledWith();

  await fireEvent.click(toggleLockRoomButton);

  expect(toggleLockRoom).toHaveBeenCalledTimes(2);

  // We are not the room owner anymore
  rerender(
    <Nav
      members={[
        { id: 'id1', username: 'alan', isOwner: true },
        { id: 'id2', username: 'dan', isOwner: false },
      ]}
      roomId={'testRoom'}
      userId={'userId'}
      roomLocked={true}
      toggleLockRoom={toggleLockRoom}
      openModal={() => {}}
      iAmOwner={false}
      translations={{}}
    />,
  );

  await fireEvent.click(toggleLockRoomButton);

  expect(toggleLockRoom).toHaveBeenCalledTimes(2);

  await getByText('You must be the owner to lock or unlock the room');

  // Wait tooltip closing
  await act(() => vi.runAllTimers());

  expect(queryByText('You must be the owner to lock or unlock the room')).not.toBeInTheDocument();
});

test('Can show user list', async () => {
  // Test with one user owner and me
  const { getByTitle, getByText, queryByTitle, rerender } = render(
    <Nav
      members={[{ id: 'id1', username: 'alan', isOwner: true }]}
      roomId={'testRoom'}
      userId={'id1'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={true}
      translations={{}}
    />,
  );

  fireEvent.click(getByTitle('Users'));

  await waitFor(() => expect(getByText('alan')).toBeInTheDocument());
  await waitFor(() => expect(getByTitle('Owner')).toBeInTheDocument());
  await waitFor(() => expect(getByTitle('Me')).toBeInTheDocument());

  // Test with two user not owner, not me
  rerender(
    <Nav
      members={[
        { id: 'id1', username: 'alan', isOwner: false },
        { id: 'id2', username: 'dan', isOwner: false },
      ]}
      roomId={'testRoom'}
      userId={'otherId'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={true}
      translations={{}}
    />,
  );

  await waitFor(() => expect(getByText('alan')).toBeInTheDocument());
  await waitFor(() => expect(getByText('dan')).toBeInTheDocument());

  expect(queryByTitle('Owner')).not.toBeInTheDocument();
  expect(queryByTitle('Me')).not.toBeInTheDocument();
});

test('Can open settings', async () => {
  const openModal = vi.fn();

  // Test with one user owner and me
  const { getByText } = render(
    <Nav
      members={[]}
      roomId={'testRoom'}
      userId={'id1'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={openModal}
      iAmOwner={true}
      translations={mockTranslations}
    />,
  );

  fireEvent.click(getByText(mockTranslations.settingsButton));

  expect(mock$).toHaveBeenLastCalledWith('.navbar-collapse');
  expect(mockCollapse).toHaveBeenLastCalledWith('hide');
  expect(openModal).toHaveBeenLastCalledWith('Settings');
});

test('Can open About', async () => {
  const openModal = vi.fn();

  // Test with one user owner and me
  const { getByText } = render(
    <Nav
      members={[]}
      roomId={'testRoom'}
      userId={'id1'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={openModal}
      iAmOwner={true}
      translations={mockTranslations}
    />,
  );

  fireEvent.click(getByText(mockTranslations.aboutButton));

  expect(mock$).toHaveBeenLastCalledWith('.navbar-collapse');
  expect(mockCollapse).toHaveBeenLastCalledWith('hide');
  expect(openModal).toHaveBeenLastCalledWith('About');
});

test('Can open About', async () => {
  window.open = vi.fn();

  // Test with one user owner and me
  const { getByText } = render(
    <Nav
      members={[]}
      roomId={'testRoom'}
      userId={'id1'}
      roomLocked={true}
      toggleLockRoom={() => {}}
      openModal={() => {}}
      iAmOwner={true}
      translations={mockTranslations}
    />,
  );

  fireEvent.click(getByText(mockTranslations.newRoomButton));

  expect(mock$).toHaveBeenLastCalledWith('.navbar-collapse');
  expect(mockCollapse).toHaveBeenLastCalledWith('hide');
  expect(window.open).toHaveBeenLastCalledWith('/fakeid');
});
