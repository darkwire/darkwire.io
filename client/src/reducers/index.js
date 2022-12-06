/* istanbul ignore file */
import { combineReducers } from 'redux';

import app from './app';
import activities from './activities';
import user from './user';
import room from './room';

const appReducer = combineReducers({
  app,
  user,
  room,
  activities,
});

const rootReducer = (state, action) => appReducer(state, action);

export default rootReducer;
