import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore, type AuthState } from '@/features/auth/store';
import { notify } from './toast';
import { api } from '@/shared/api/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wasConnectedRef = useRef(false);

  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const user = useAuthStore((state: AuthState) => state.user);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
      wasConnectedRef.current = false;
      return;
    }

    const backendUrl =
      import.meta.env.VITE_API_URL ||
      (typeof window !== 'undefined' ? `http://${window.location.hostname}:4005` : 'http://localhost:4005');
    const baseUrl = backendUrl.replace(/\/api$/, '');

    const newSocket = io(baseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (wasConnectedRef.current) {
        notify.info('Reconnected to real-time server', { id: 'socket-conn-status' });
      }
      wasConnectedRef.current = true;
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason !== 'io client disconnect') {
        notify.warning('Connection lost. Reconnecting...', { id: 'socket-conn-status' });
      }
    });

    // Handle token expiration: silent refresh and reconnect
    newSocket.on('auth:token_expired', async () => {
      try {
        await api.post('/auth/refresh', undefined, { silent: true });
        newSocket.connect();
      } catch {
        useAuthStore.getState().logout();
      }
    });

    // Handle session supersede (one active socket per user policy)
    newSocket.on('auth:superseded', (payload: { message?: string }) => {
      notify.warning(payload?.message || 'You connected from another session.', {
        id: 'socket-superseded',
      });
      newSocket.disconnect();
    });

    // Handle session revocation (logout-all)
    newSocket.on('auth:revoked', (payload: { message?: string }) => {
      notify.error(payload?.message || 'Session revoked.', { id: 'socket-revoked' });
      useAuthStore.getState().logout();
    });

    newSocket.on('connect_error', () => {
      // Avoid spamming toasts on temporary disconnects
    });

    newSocket.on('error:validation', (payload: { message?: string; fields?: Record<string, string> }) => {
      notify.error(payload?.message || 'Invalid real-time action', { id: 'socket-validation-error' });
    });

    newSocket.on('error', (payload: { message?: string }) => {
      notify.error(payload?.message || 'Server error', { id: 'socket-generic-error' });
    });

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
