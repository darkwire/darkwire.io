/* istanbul ignore file */
import { configureStore } from '@reduxjs/toolkit'

import reducers from '@/reducers';


export default function confStore(preloadedState) {
  const store = configureStore({reducer:reducers, preloadedState })
  return store;
}
