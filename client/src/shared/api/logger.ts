import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

export const logRequest = (config: InternalAxiosRequestConfig) => {
  const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  config.metadata = {
    start: performance.now(),
    requestId: reqId
  };

  // Removed console.log to keep browser console clean
};

export const logResponse = (_response: AxiosResponse) => {
  // Removed console.log to keep browser console clean
};

export const logErrorAndToast = (error: AxiosError | any) => {
  const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
  const url = originalRequest?.url ?? '';
  const status = error.response?.status;

  if (import.meta.env.DEV && originalRequest) {
    const reqId = originalRequest.metadata?.requestId || 'unknown';
    const start = originalRequest.metadata?.start || performance.now();
    const duration = (performance.now() - start).toFixed(2);
    
    // We only log errors to keep the console clean
    console.error(`[API][${reqId}] Error: ${status || 'Network Error'} ${url} [${duration}ms]`);
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
