import { create } from 'zustand';
import type { UserPayload } from '@astranox/types';
import { api } from '@/shared/api/api';
import { getQueryClient } from '@/lib/queryClient';

export interface AuthState {
  user: UserPayload | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  // accessToken kept as null for type compatibility with any legacy read
  accessToken?: string | null;
  setUser: (user: UserPayload | null) => void;
  setAuth: (userOrToken: string | UserPayload, maybeUser?: UserPayload) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  accessToken: null,

  setUser: (user) => set({ user, isAuthenticated: !!user, isInitialized: true, accessToken: null }),

  setAuth: (userOrToken, maybeUser) => {
    const user = typeof userOrToken === 'string' ? maybeUser || null : userOrToken;
    set({ user, isAuthenticated: !!user, isInitialized: true, accessToken: null });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      set({ user: null, isAuthenticated: false, isInitialized: true, accessToken: null });
      getQueryClient().clear();
    }
  },

  initialize: async () => {
    try {
      const { data } = await api.post('/auth/refresh', undefined, { silent: true });
      set({
        user: data.data.user,
        isAuthenticated: true,
        isInitialized: true,
        accessToken: null,
      });
    } catch {
      // Failure renders the logged-out state cleanly (no retry loop)
      set({ user: null, isAuthenticated: false, isInitialized: true, accessToken: null });
    }
  },
}));
