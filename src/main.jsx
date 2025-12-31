import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

const root = createRoot(document.getElementById('root'));
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

root.render(
  <React.StrictMode>
    <ErrorBoundary>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);


