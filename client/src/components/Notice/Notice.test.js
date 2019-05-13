import React from 'react'
import renderer from 'react-test-renderer'
import Notice from './index.js'
import { mount } from 'enzyme'

test.skip('Notice Component', () => {
  const component = mount(
    <Notice>
      <div>Hello world</div>
    </Notice>
  )

  expect(component).toMatchSnapshot()
})
