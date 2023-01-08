import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/index.css';
import { Routing } from './routes';
import { GenProvider } from './contexts/GeneralContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GenProvider>
      <Routing />
    </GenProvider>
  </React.StrictMode>
);

