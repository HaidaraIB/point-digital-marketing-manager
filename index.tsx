import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Production environment shim for common global expectations
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: { NODE_ENV: 'production', API_KEY: '' } };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical Error: Root element '#root' not found in document.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } catch (err) {
    console.error("Failed to initialize React application:", err);
  }
}