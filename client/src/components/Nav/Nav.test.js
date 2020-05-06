import React from 'react';
import { render } from '@testing-library/react';
import Nav from '.';

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
    />
  );

  expect(asFragment()).toMatchSnapshot();
});

test('Nav component is displaying with another configuration', async () => {
  const { asFragment } = render(
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
    />
  );

  expect(asFragment()).toMatchSnapshot();
});
