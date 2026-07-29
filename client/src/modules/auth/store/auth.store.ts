import { create } from 'zustand';
import type { UserPayload } from '@astranox/shared';
import { api } from '@/shared/api/api';
import { getQueryClient } from '@/shared/api/query-client';

interface AuthState {
  accessToken: string | null;
  user: UserPayload | null;
  isInitialized: boolean;
  setAuth: (token: string, user: UserPayload) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,

  setAuth: (token, user) => set({ accessToken: token, user, isInitialized: true }),

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      set({ accessToken: null, user: null, isInitialized: true });
      getQueryClient().clear();
    }
  },

  initialize: async () => {
    try {
      const { data } = await api.post('/auth/refresh', undefined, { silent: true });
      set({ 
        accessToken: data.data.accessToken, 
        user: data.data.user,
        isInitialized: true 
      });
    } catch (error: any) {
      if (error?.status === 401 || error?.response?.status === 401) {
        set({ accessToken: null, user: null, isInitialized: true });
      } else {
        // Critical network or server error during boot
        throw error;
      }
    }
  },
}));
