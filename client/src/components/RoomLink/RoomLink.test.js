import React from 'react';
import { render } from '@testing-library/react';
import RoomLink from '.';

test('RoomLink component is displaying', async () => {
  const { asFragment } = render(<RoomLink roomId='roomId' translations={{}} />);

  expect(asFragment()).toMatchSnapshot();
});
