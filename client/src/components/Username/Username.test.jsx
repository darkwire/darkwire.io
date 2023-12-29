import React from 'react';
import { render } from '@testing-library/react';
import { test, expect } from 'vitest';

import Username from '.';

test('Username component is displaying', async () => {
  const { asFragment } = render(<Username username="paul" />);

  expect(asFragment()).toMatchSnapshot();
});
