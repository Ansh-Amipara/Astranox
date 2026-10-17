import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './config/env';
import { logger } from './config/logger';
import { verifyAccessToken } from './core/utils/jwt';
import type { UserPayload } from '@astranox/types';

let io: Server;

// Track active sockets: userId -> socketId (one active socket per user policy)
export const userSockets = new Map<string, string>();

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    const trimmedName = name?.trim();
    if (!trimmedName) return;
    const value = rest.join('=').trim();
    if (!value) return;
    try {
      list[trimmedName] = decodeURIComponent(value);
    } catch {
      list[trimmedName] = value;
    }
  });
  return list;
}

export const socketAuthMiddleware = (socket: any, next: (err?: Error) => void) => {
  const cookieHeader = socket.handshake?.headers?.cookie;
  const cookies = parseCookies(cookieHeader);
  const token =
    cookies.accessToken ||
    socket.handshake?.auth?.token ||
    (socket.handshake?.headers?.authorization?.startsWith('Bearer ')
      ? socket.handshake.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return next(new Error('AUTHENTICATION_ERROR: Missing authentication credentials'));
  }

  try {
    const decoded = verifyAccessToken(token) as UserPayload & { exp?: number };
    socket.data = socket.data || {};
    socket.data.user = decoded;
    socket.user = decoded; // backward compatibility
    next();
  } catch {
    return next(new Error('AUTHENTICATION_ERROR: Token expired or invalid'));
  }
};

export const handleSocketConnection = (socket: any, serverIO?: any) => {
  const currentIO = serverIO || io;
  const user = (socket.data?.user || socket.user) as UserPayload & { exp?: number };
  if (!user) return;
  const userId = user.id;

  logger.debug(`Socket client connected: ${socket.id} (User: ${userId})`);

  // One active socket per user: kick older connection
  const existingSocketId = userSockets.get(userId);
  if (existingSocketId && existingSocketId !== socket.id) {
    const oldSocket = currentIO?.sockets?.sockets?.get?.(existingSocketId);
    if (oldSocket) {
      logger.info(`Disconnecting superseded socket ${existingSocketId} for user ${userId}`);
      oldSocket.emit('auth:superseded', {
        code: 'SESSION_SUPERSEDED',
        message: 'You have connected from another window or device.',
      });
      oldSocket.disconnect(true);
    }
  }
  userSockets.set(userId, socket.id);

  if (typeof socket.join === 'function') {
    socket.join(`user:${userId}`);
  }

  // Clean disconnect on token expiration
  if (user.exp) {
    const msUntilExpiry = user.exp * 1000 - Date.now();
    if (msUntilExpiry > 0) {
      const timer = setTimeout(() => {
        if (socket.connected) {
          logger.info(`Token expired for socket ${socket.id} (user ${userId}). Disconnecting cleanly.`);
          socket.emit('auth:token_expired', {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired. Please re-authenticate.',
          });
          socket.disconnect(true);
        }
      }, msUntilExpiry);

      if (typeof socket.on === 'function') {
        socket.on('disconnect', () => {
          clearTimeout(timer);
        });
      }
    }
  }

  if (typeof socket.on === 'function') {
    socket.on('disconnect', () => {
      if (userSockets.get(userId) === socket.id) {
        userSockets.delete(userId);
      }
      logger.debug(`Client disconnected from socket: ${socket.id}`);
    });
  }
};

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = env.allowedOrigins.some(
          (allowed) => allowed === origin || allowed === '*'
        );
        if (isAllowed) return callback(null, true);
        return callback(new Error(`Socket.io CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);
  io.on('connection', (socket) => handleSocketConnection(socket, io));

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};

/**
 * Shared Socket Ownership Verification Helper
 * Ensures a player can only act on resources they own.
 */
export const verifySocketOwnership = (socket: Socket | any, resourceOwnerId: string): boolean => {
  const currentUserId = socket.data?.user?.id || socket.user?.id;
  if (!currentUserId || currentUserId !== resourceOwnerId) {
    socket.emit('error', {
      code: 'FORBIDDEN',
      message: 'You are not authorized to perform actions on this resource.',
    });
    return false;
  }
  return true;
};
