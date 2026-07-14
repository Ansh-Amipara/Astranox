import { create } from 'zustand';
import type { UserPayload } from '@astranox/shared';
import { api } from '../api/api';

interface AuthState {
  accessToken: string | null;
  user: UserPayload | null;
  isInitialized: boolean;
  setAuth: (token: string, user: UserPayload) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,

  setAuth: (token, user) => set({ accessToken: token, user, isInitialized: true }),

  logout: () => {
    api.post('/auth/logout').catch(() => {});
    set({ accessToken: null, user: null, isInitialized: true });
  },

  initialize: async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      set({ 
        accessToken: data.data.accessToken, 
        user: data.data.user,
        isInitialized: true 
      });
    } catch {
      set({ accessToken: null, user: null, isInitialized: true });
    }
  },
}));
