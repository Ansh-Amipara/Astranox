import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore, type AuthState } from '@/features/auth/store';
import { notify } from './toast';

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

  const accessToken = useAuthStore((state: AuthState) => state.accessToken);

  useEffect(() => {
    if (!accessToken) {
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
      auth: {
        token: accessToken,
      },
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

    newSocket.on('connect_error', () => {
      // Avoid spamming if server is temporarily unreachable
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
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
