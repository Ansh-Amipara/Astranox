import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './config/env';
import { logger } from './config/logger';

import { verifyAccessToken } from './core/utils/jwt';
import type { UserPayload } from '@astranox/shared';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN === 'true' ? true : env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = verifyAccessToken(token) as UserPayload;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as UserPayload;
    logger.debug(`Client connected to socket: ${socket.id} (User: ${user.id})`);
    
    // Join a personal room for targeted events
    socket.join(`user:${user.id}`);
    
    socket.on('disconnect', () => {
      logger.debug(`Client disconnected from socket: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};
