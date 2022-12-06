import React from 'react';
import { render } from '@testing-library/react';
import RoomLocked from '.';
import { test, expect } from 'vitest';

test('RoomLocked component should display', () => {
  const { asFragment } = render(<RoomLocked modalContent={'test'} />);
  expect(asFragment()).toMatchSnapshot();
});
