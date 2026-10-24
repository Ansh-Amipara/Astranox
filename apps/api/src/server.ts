import 'reflect-metadata';
import { env } from './config/env';
import { createServer } from 'http';
import { initSocket } from './socket';
import { logger } from './config/logger';
import { startMarketplaceWorker } from './modules/marketplace/marketplace.worker';
import { app } from './app';
import { BattlesGateway } from './modules/battles/battles.gateway';
import { container } from 'tsyringe';

const port = env.API_PORT;

const httpServer = createServer(app);
initSocket(httpServer);

let currentPort = Number(port) || 4005;

httpServer.on('listening', () => {
  logger.info(`Server running on port ${currentPort}`);
  
  const battlesGateway = container.resolve(BattlesGateway);
  battlesGateway.initialize();

  startMarketplaceWorker();
});

httpServer.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.warn(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
    currentPort++;
    httpServer.listen(currentPort);
  } else {
    logger.error('Server error', err);
    process.exit(1);
  }
});

httpServer.listen(currentPort);
