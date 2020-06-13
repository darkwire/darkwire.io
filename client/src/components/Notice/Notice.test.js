import React from 'react';
import { render } from '@testing-library/react';
import Notice from '.';

test('Notice component is displaying', async () => {
  const { asFragment } = render(
    <Notice level={'warning'}>
      <div>Hello world</div>
    </Notice>,
  );

  expect(asFragment()).toMatchSnapshot();
});
