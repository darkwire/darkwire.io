import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { nanoid } from 'nanoid';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-simple-dropdown/styles/Dropdown.css';
import './stylesheets/app.sass';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-tooltip/dist/react-tooltip.css';

import configureStore from '@/store/';
import Home from '@/components/Home/';
import { hasTouchSupport } from '@/utils/dom';
import { loadPersistedState, persistState } from '@/utils/persistence';

const store = configureStore(loadPersistedState());
store.subscribe(() => persistState(store));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={`/${nanoid()}`} replace />,
  },
  {
    path: '/:roomId',
    element: <Home />,
    loader({ params }) {
      return encodeURI(params.roomId ? params.roomId : '');
    },
  },
]);

const Main = () => {
  React.useEffect(() => {
    if (hasTouchSupport) {
      document.body.classList.add('touch');
    }
  }, []);

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};


if (!window.crypto || !window.crypto.subtle) {
  window.alert("You must access Darkwire from a secure HTTPS connection.")
  throw new Error("You must access Darkwire from a secure HTTPS connection.")
}

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
