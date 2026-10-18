import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { notify } from './toast';
import { parseApiError } from './apiError';

export const logRequest = (config: InternalAxiosRequestConfig) => {
  const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  config.metadata = {
    start: performance.now(),
    requestId: reqId,
  };
};

export const logResponse = (_response: AxiosResponse) => {
  // Kept clean for production
};

export const logErrorAndToast = (error: AxiosError | any) => {
  const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
  const url = originalRequest?.url ?? '';
  const status = error.response?.status;
  const isSilent = originalRequest?.silent === true;

  if (import.meta.env.NODE_ENV === 'development' && originalRequest && !isSilent) {
    const reqId = originalRequest.metadata?.requestId || 'unknown';
    const start = originalRequest.metadata?.start || performance.now();
    const duration = (performance.now() - start).toFixed(2);
    console.error(`[API][${reqId}] Error: ${status || 'Network Error'} ${url} [${duration}ms]`);
  }

  // Toast notifications if not silent
  if (originalRequest && !isSilent) {
    const parsed = parseApiError(error);

    // Bypass global toast for field-level validation errors so forms can render them
    if (parsed.isValidationError) {
      return;
    }

    // Do not show error toast for background 401 refresh requests
    if (url.includes('/auth/refresh')) {
      return;
    }

    if (status === 401) {
      notify.error('Session expired. Please log in again.', { id: 'auth-unauthorized' });
      return;
    }

    if (status === 429) {
      notify.warning('Too many requests. Please slow down.', { id: 'rate-limit-warning' });
      return;
    }

    const serverRequestId =
      error.response?.data?.error?.requestId ||
      (error.response?.headers?.['x-request-id'] as string) ||
      undefined;

    notify.error(parsed.message, {
      id: `api-err-${url}-${status}`,
      description: serverRequestId ? `Request ID: ${serverRequestId}` : undefined,
    });
  }
};
