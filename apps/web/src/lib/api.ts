import axios from 'axios';
import { useAuthStore } from '@/features/auth/store';
import { logRequest, logResponse, logErrorAndToast } from '@/lib/logger';

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

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? `http://${window.location.hostname}:4005`
    : 'http://localhost:4005');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export { getSpriteUrl } from './axios';

// Singleton refresh state and queue
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

api.interceptors.request.use((config) => {
  logRequest(config);
  return config;
});

api.interceptors.response.use(
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

    const isRetryable401 =
      error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute;

    if (isRetryable401) {
      if (isRefreshing) {
        // Queue concurrent requests while a refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios
          .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
          .then(({ data }) => {
            useAuthStore.getState().setUser(data.data.user);
            processQueue(null);
            resolve(api(originalRequest));
          })
          .catch((refreshError) => {
            processQueue(refreshError);
            useAuthStore.getState().logout();
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    logErrorAndToast(error);

    // Standardize error payload for frontend consumption
    const customError = new Error(
      error.response?.data?.error?.message || error.message || 'An unexpected error occurred'
    ) as Error & { code?: string; status?: number; data?: unknown };

    customError.code = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

export const trainerApi = {
  getMe: async () => {
    const { data } = await api.get('/trainers/me');
    return data.data;
  },
};

export const shopApi = {
  getItems: async () => {
    const { data } = await api.get('/shop/items');
    return data.data;
  },
  purchase: async (input: { itemKey: string; quantity: number; expectedPrice?: number }) => {
    const idempotencyKey = crypto.randomUUID();
    const { data } = await api.post('/shop/purchase', input, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return data;
  },
  buyItem: async (itemId: string, quantity: number) => {
    const { data } = await api.post('/shop/buy', { itemId, quantity });
    return data;
  },
  buyBulk: async (items: { itemId: string; quantity: number }[]) => {
    const { data } = await api.post('/shop/buy-bulk', { items });
    return data;
  },
  sellItem: async (itemId: string, quantity: number) => {
    const { data } = await api.post('/shop/sell', { itemId, quantity });
    return data;
  },
  sellBulk: async (items: { itemId: string; quantity: number }[]) => {
    const { data } = await api.post('/shop/sell-bulk', { items });
    return data;
  },
  getMoves: async () => {
    const { data } = await api.get('/shop/moves');
    return data.data;
  },
  buyMove: async (moveId: number) => {
    const { data } = await api.post('/shop/moves/buy', { moveId });
    return data;
  },
};

export const worldApi = {
  getMacroLayout: async () => {
    const { data } = await api.get('/world');
    return data.data;
  },
  getMapDetails: async (mapId: string) => {
    const { data } = await api.get(`/world/map/${mapId}`);
    return data.data;
  },
  travel: async (targetMapId: string, connectionId?: string) => {
    const { data } = await api.post('/world/travel', { targetMapId, connectionId });
    return data.data;
  },
  getProgress: async () => {
    const { data } = await api.get('/world/progress');
    return data.data;
  },
};

export const battleApi = {
  runFromBattle: async () => {
    const { data } = await api.post('/battles/turn', { action: 'run' });
    return data.data;
  },
  engageCustomBattle: async (params: { speciesId: number; level: number; battleType?: string }) => {
    const { data } = await api.post('/battles/engage-custom', params);
    return data.data;
  },
};

export const pokedexApi = {
  getAllSpecies: async (page = 1, limit = 24, type?: string, category?: string) => {
    const res = await api.get('/pokedex', { params: { page, limit, type, category } });
    return res.data;
  },
  getSpeciesById: async (id: number) => {
    const res = await api.get(`/pokedex/${id}`);
    return res.data;
  },
};
