import { useAuthStore } from '@/modules/auth/store/auth.store';
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

export function setupInterceptors() {
  apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

      logErrorAndToast(error);
      if (
        error.response?.status === 401 && 
        !originalRequest?._retry && 
        !url.includes('/auth/refresh') && 
        !url.includes('/auth/logout') && 
        !url.includes('/auth/login')
      ) {
        originalRequest._retry = true;
        try {
          const { data } = await apiClient.post('/auth/refresh', undefined, { silent: true });
          useAuthStore.getState().setAuth(data.data.accessToken, data.data.user);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return apiClient(originalRequest);
        } catch (err) {
          useAuthStore.getState().logout();
          return Promise.reject(err);
        }
      }

      const customError = new Error(
        error.response?.data?.error?.message || error.message || 'An unexpected error occurred'
      ) as Error & { code?: string; status?: number; data?: any };
      
      customError.code = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
      customError.status = error.response?.status;
      customError.data = error.response?.data;

      return Promise.reject(customError);
    }
  );
}
