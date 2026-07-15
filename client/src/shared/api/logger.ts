import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

export const logRequest = (config: InternalAxiosRequestConfig) => {
  const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  config.metadata = {
    start: performance.now(),
    requestId: reqId
  };

  if (import.meta.env.DEV) {
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = config.url ?? '';
    console.groupCollapsed(`[API][${reqId}] Request: ${method} ${url}`);
    console.table({
      id: reqId,
      method,
      url
    });
    if (config.data) console.log('Payload:', config.data);
    if (config.params) console.log('Params:', config.params);
    console.groupEnd();
  }
};

export const logResponse = (response: AxiosResponse) => {
  if (import.meta.env.DEV) {
    const config = response.config;
    const reqId = config.metadata?.requestId || 'unknown';
    const start = config.metadata?.start || performance.now();
    const duration = (performance.now() - start).toFixed(2);
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = config.url ?? '';

    console.groupCollapsed(`[API][${reqId}] Response: ${response.status} ${url} [${duration}ms]`);
    console.table({
      id: reqId,
      method,
      url,
      status: response.status,
      duration: `${duration}ms`
    });
    console.log('Data:', response.data);
    console.groupEnd();
  }
};

export const logErrorAndToast = (error: AxiosError | any) => {
  const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
  const url = originalRequest?.url ?? '';
  const status = error.response?.status;
  const method = originalRequest?.method?.toUpperCase() || 'UNKNOWN';

  if (import.meta.env.DEV && originalRequest) {
    const reqId = originalRequest.metadata?.requestId || 'unknown';
    const start = originalRequest.metadata?.start || performance.now();
    const duration = (performance.now() - start).toFixed(2);
    
    console.groupCollapsed(`[API][${reqId}] Error: ${status || 'Network Error'} ${url} [${duration}ms]`);
    console.table({
      id: reqId,
      method,
      url,
      status: status || 'Network Error',
      duration: `${duration}ms`
    });
    console.log('Error Data:', error.response?.data);
    console.log('Message:', error.message);
    console.groupEnd();
  }

  // Toast notifications
  if (originalRequest && !originalRequest.silent) {
    const data = error.response?.data as any;
    const serverMessage = data?.message ?? data?.error?.message ?? data?.error ?? undefined;
    
    let toastMsg = "Something went wrong on our end";
    
    if (serverMessage && typeof serverMessage === 'string') {
      toastMsg = serverMessage;
    } else {
      switch (status) {
        case 400:
          toastMsg = "Invalid request";
          break;
        case 401:
          toastMsg = "Session expired, please log in again";
          break;
        case 403:
          toastMsg = "You don't have permission for this action";
          break;
        case 404:
          toastMsg = "Not found";
          break;
        case 409:
          toastMsg = "Conflict";
          break;
        case 422:
          toastMsg = "Validation failed";
          break;
        case 429:
          toastMsg = "Too many requests";
          break;
        default:
          toastMsg = (status && status >= 500)
            ? "Something went wrong on our end"
            : "Request failed";
      }
    }
    
    toast.error(toastMsg);
  }
};
