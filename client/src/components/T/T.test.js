import React from 'react';
import { render } from '@testing-library/react';

import T from './T';

// To avoid missing provider
jest.mock('components/T');

test('T component is displaying', async () => {
  const { asFragment } = render(<T path='test' />);

  expect(asFragment()).toMatchSnapshot();
});
