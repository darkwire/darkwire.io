import React from 'react'
import { render } from '@testing-library/react'
import About from '.'

test('About component is displaying', async () => {
  const {asFragment} = render(<About roomId={'test'}/>)

  expect(asFragment()).toMatchSnapshot()
})