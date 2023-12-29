import React from 'react';
import { render } from '@testing-library/react';
import { test, expect, vi } from 'vitest';

import T from './T';

// To avoid missing provider
vi.mock('components/T');

test('T component is displaying', async () => {
  const { asFragment, rerender } = render(<T path="welcomeHeader" language="en" />);

  expect(asFragment()).toMatchSnapshot();

  rerender(<T path="welcomeHeader" language="fr" />);

  expect(asFragment()).toMatchSnapshot();

  rerender(<T path="welcomeHeader" language="xx" />);

  expect(asFragment()).toMatchSnapshot();

  rerender(<T path="missingKey" language="en" />);

  expect(asFragment()).toMatchSnapshot();

  rerender(<T path="userJoined" language="en" data={{ username: 'Alan' }} />);

  expect(asFragment()).toMatchSnapshot();

  rerender(<T path="userJoined" language="en" />);

  expect(asFragment()).toMatchSnapshot();
});
