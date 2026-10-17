import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { parseApiError } from './apiError';
import { notify } from './toast';

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.suppressGlobalToast) return;
        const parsed = parseApiError(error);
        if (parsed.isValidationError) return;
        notify.error(parsed.message, { id: `query-${query.queryHash}` });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.suppressGlobalToast) return;
        const parsed = parseApiError(error);
        if (parsed.isValidationError) return;
        notify.error(parsed.message, { id: `mutation-${parsed.message}` });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Never retry on 4xx errors
          if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
