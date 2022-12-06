import React from 'react';
import { render } from '@testing-library/react';
import Message from '.';
import { test, expect } from 'vitest';

test('Message component is displaying', async () => {
  const { asFragment } = render(<Message sender={'linus'} timestamp={1588794269074} message={'we come in peace'} />);

  expect(asFragment()).toMatchSnapshot();
});
