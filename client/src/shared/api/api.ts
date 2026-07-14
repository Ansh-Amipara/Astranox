import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

export const getSpriteUrl = (id: string | number) => `${api.defaults.baseURL}/sprites/${id}.png`;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url || '';
    if (error.response?.status === 401 && !originalRequest._retry && !url.includes('/auth/refresh') && !url.includes('/auth/logout') && !url.includes('/auth/login')) {
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
    return Promise.reject(error);
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
