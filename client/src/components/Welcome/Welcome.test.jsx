import React from 'react';
import { render } from '@testing-library/react';
import { test, expect, vi } from 'vitest';

import Welcome from '.';

vi.mock('@/components/RoomLink');

test('Welcome component is displaying', async () => {
  const { asFragment } = render(<Welcome roomId="roomtest" close={() => {}} translations={{}} />);

  expect(asFragment()).toMatchSnapshot();
});
