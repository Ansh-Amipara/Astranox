import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './config/env';
import { logger } from './config/logger';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN === 'true' ? true : env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.debug(`Client connected to socket: ${socket.id}`);
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
