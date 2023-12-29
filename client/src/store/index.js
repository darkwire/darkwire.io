/* istanbul ignore file */
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import reducers from '@/reducers';

const composeEnhancers =
  import.meta.env.NODE_ENV === 'production' ? compose : window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enabledMiddlewares = [thunk];

const middlewares = applyMiddleware(...enabledMiddlewares);

export default function configureStore(preloadedState) {
  const store = createStore(reducers, preloadedState, composeEnhancers(middlewares));
  return store;
}
