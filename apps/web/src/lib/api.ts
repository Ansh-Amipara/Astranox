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

export const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:4005` : 'http://localhost:4005');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export { getSpriteUrl } from './axios';

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

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

    const isRetryable401 = error.response?.status === 401 && !originalRequest?._retry && !url.includes('/auth/refresh') && !url.includes('/auth/logout') && !url.includes('/auth/login');

    if (isRetryable401) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        useAuthStore.getState().setAuth(data.data.accessToken, data.data.user);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        useAuthStore.getState().logout();
        return Promise.reject(err);
      }
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
  }
};

export const shopApi = {
  getItems: async () => {
    const { data } = await api.get('/shop/items');
    return data.data;
  },
  buyItem: async (itemId: string, quantity: number) => {
    const { data } = await api.post('/shop/buy', { itemId, quantity });
    return data;
  },
  buyBulk: async (items: { itemId: string, quantity: number }[]) => {
    const { data } = await api.post('/shop/buy-bulk', { items });
    return data;
  },
  sellItem: async (itemId: string, quantity: number) => {
    const { data } = await api.post('/shop/sell', { itemId, quantity });
    return data;
  },
  sellBulk: async (items: { itemId: string, quantity: number }[]) => {
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
  }
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
  }
};

export const battleApi = {
  runFromBattle: async () => {
    const { data } = await api.post('/battles/turn', { action: 'run' });
    return data.data;
  },
  engageCustomBattle: async (params: { speciesId: number, level: number, battleType?: string }) => {
    const { data } = await api.post('/battles/engage-custom', params);
    return data.data;
  }
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
