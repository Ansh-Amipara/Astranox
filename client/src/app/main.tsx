import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryProvider } from '../providers/QueryProvider';
import { SocketProvider } from '../contexts/SocketContext';
import { Toaster } from 'sonner';
import '../styles/globals.css';

import { ErrorBoundary } from 'react-error-boundary';
import { GlobalErrorFallback } from '@/shared/ui/ErrorFallback';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <QueryProvider>
        <SocketProvider>
          <App />
          <Toaster richColors position="bottom-right" />
        </SocketProvider>
      </QueryProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
