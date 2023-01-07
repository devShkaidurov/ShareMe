import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';
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

