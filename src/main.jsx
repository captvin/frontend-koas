import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider dari Material UI
import theme from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
    <App />
    </ThemeProvider>
    
  </React.StrictMode>
);

// Mengaktifkan service worker untuk PWA
serviceWorkerRegistration.register();