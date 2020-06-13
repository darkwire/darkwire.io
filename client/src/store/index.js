/* istanbul ignore file */
import { createStore, applyMiddleware, compose } from 'redux';
import reducers from 'reducers';
import thunk from 'redux-thunk';

const composeEnhancers =
  process.env.NODE_ENV === 'production' ? compose : window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enabledMiddlewares = [thunk];

const middlewares = applyMiddleware(...enabledMiddlewares);

export default function configureStore(preloadedState) {
  const store = createStore(reducers, preloadedState, composeEnhancers(middlewares));

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      // eslint-disable-next-line global-require
      const nextRootReducer = require('../reducers/index');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
