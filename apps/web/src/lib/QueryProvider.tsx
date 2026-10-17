
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from './queryClient';
import type { ReactNode } from 'react';
import { setupInterceptors } from './interceptors';

// Setup interceptors on the client side only once
if (typeof window !== 'undefined') {
  setupInterceptors();
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
