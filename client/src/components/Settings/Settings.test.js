import React from 'react';
import { render } from '@testing-library/react';

import Settings from '.';

// To avoid missing provider
jest.mock('components/T');

test('Settings component is displaying', async () => {
  const { asFragment } = render(
    <Settings
      soundIsEnabled={true}
      toggleSoundEnabled={() => {}}
      roomId='roomId'
      setLanguage={() => {}}
      translations={{}}
    />
  );

  expect(asFragment()).toMatchSnapshot();
});
