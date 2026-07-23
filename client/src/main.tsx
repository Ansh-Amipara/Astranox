import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryProvider } from './providers/QueryProvider';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from 'sonner';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <SocketProvider>
        <App />
        <Toaster richColors position="bottom-right" />
      </SocketProvider>
    </QueryProvider>
  </React.StrictMode>
);
