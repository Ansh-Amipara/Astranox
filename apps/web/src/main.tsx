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
          <Toaster
            position="top-right"
            visibleToasts={3}
            toastOptions={{
              className: 'bg-surface text-foreground border border-border shadow-md font-sans text-sm',
            }}
          />
        </SocketProvider>
      </QueryProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
