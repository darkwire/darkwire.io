import React from 'react';
import { render } from '@testing-library/react';

import Welcome from '.';

test('Welcome component is displaying', async () => {
  const { asFragment } = render(<Welcome roomId="roomtest" close={() => {}} translations={{}} />);

  expect(asFragment()).toMatchSnapshot();
});
