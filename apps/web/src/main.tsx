import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './routes';
import { QueryProvider } from './lib/QueryProvider';
import { SocketProvider } from './lib/SocketContext';
import { Toaster } from 'sonner';
import './styles/globals.css';

import { ErrorBoundary } from 'react-error-boundary';
import { GlobalErrorFallback } from '@/components/ui/ErrorFallback';

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
