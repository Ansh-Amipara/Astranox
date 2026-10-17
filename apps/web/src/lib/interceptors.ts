import { useAuthStore } from '@/features/auth/store';
import { logRequest, logResponse, logErrorAndToast } from './logger';
import { apiClient } from './axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    silent?: boolean;
    metadata?: { start: number; requestId: string };
  }
  export interface InternalAxiosRequestConfig {
    silent?: boolean;
    metadata?: { start: number; requestId: string };
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

export function setupInterceptors() {
  apiClient.interceptors.request.use((config) => {
    logRequest(config);
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      logResponse(response);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const url = originalRequest?.url || '';

      const isAuthRoute =
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register');

      const shouldAttemptRefresh =
        error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute;

      if (shouldAttemptRefresh) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => apiClient(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          apiClient
            .post('/auth/refresh', undefined, { silent: true })
            .then(({ data }) => {
              useAuthStore.getState().setUser(data.data.user);
              processQueue(null);
              resolve(apiClient(originalRequest));
            })
            .catch((err) => {
              processQueue(err);
              useAuthStore.getState().logout();
              logErrorAndToast(err);
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      logErrorAndToast(error);

      const customError = new Error(
        error.response?.data?.error?.message || error.message || 'An unexpected error occurred'
      ) as Error & { code?: string; status?: number; data?: unknown };

      customError.code = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
      customError.status = error.response?.status;
      customError.data = error.response?.data;

      return Promise.reject(customError);
    }
  );
}
