import { Provider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { createDomainStore } from '##/domain/store';
import { router } from '##/view/router';

import '##/view/index.css';

const store = createDomainStore();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
