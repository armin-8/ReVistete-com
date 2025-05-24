// src/front/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { StoreProvider } from './hooks/useGlobalReducer';
import { BackendURL } from './components/BackendURL';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function App() {
  if (!backendUrl || backendUrl === '') {
    return <BackendURL />;
  }
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  );
}

const container = document.getElementById('root');

// Guard para no volver a crear el root en recargas HMR
if (!window.__react_root__) {
  window.__react_root__ = ReactDOM.createRoot(container);
}

window.__react_root__.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
