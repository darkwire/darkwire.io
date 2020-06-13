import React from 'react';
import { render } from '@testing-library/react';
import Connecting from '.';

test('Connecting component is displaying', async () => {
  const { asFragment } = render(<Connecting />);

  expect(asFragment()).toMatchSnapshot();
});
