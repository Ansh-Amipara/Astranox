import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { logRequest, logResponse, logErrorAndToast } from './logger';

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

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'd0baluu2';
export const getSpriteUrl = (id: string | number) => `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1/astranox/pokemon/${id}.png`;

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

    logErrorAndToast(error);
    if (error.response?.status === 401 && !originalRequest?._retry && !url.includes('/auth/refresh') && !url.includes('/auth/logout') && !url.includes('/auth/login')) {
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



    // Standardize error payload for frontend consumption
    const customError = new Error(
      error.response?.data?.error?.message || error.message || 'An unexpected error occurred'
    ) as Error & { code?: string; status?: number; data?: any };
    
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

export const realmsApi = {
  getRealms: async () => {
    const { data } = await api.get('/realms');
    return data.data;
  },
  getRealmById: async (id: string) => {
    const { data } = await api.get(`/realms/${id}`);
    return data.data;
  },
  exploreRealm: async (realmId: string) => {
    const { data } = await api.post(`/realms/${realmId}/explore`);
    return data.data;
  }
};

export const battleApi = {
  runFromBattle: async () => {
    const { data } = await api.post('/battles/turn', { action: 'run' });
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
