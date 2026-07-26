import { env } from './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ASTRANOX_VERSION } from '@astranox/shared';
import { createServer } from 'http';
import { initSocket } from './socket';

import { authRoutes } from './modules/auth/auth.routes';
import { trainersRoutes } from './modules/trainers/trainers.routes';
import { battlesRoutes } from './modules/battles/battles.routes';
import { shopRoutes } from './modules/shop/shop.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { tradesRoutes } from './modules/trades/trades.routes';
import { rankRoutes } from './modules/rank/rank.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';

import pokedexRoutes from './modules/pokedex/pokedex.routes';
import towerRoutes from './modules/tower/tower.routes';
import { riftRoutes } from './modules/rift/rift.routes';
import { errorHandler } from './common/middleware/error-handler';
import { httpLogger } from './common/middleware/http-logger';
import cookieParser from 'cookie-parser';
import { logger } from './config/logger';

const app = express();
const port = env.PORT;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CORS_ORIGIN === 'true' ? true : env.CORS_ORIGIN, credentials: true }));
app.use(httpLogger);
app.use(express.json());
app.use(cookieParser());

// Sprites are now served from Cloudinary

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: ASTRANOX_VERSION });
});

app.use('/auth', authRoutes);
app.use('/trainers', trainersRoutes);
app.use('/battles', battlesRoutes);
app.use('/shop', shopRoutes);
app.use('/admin', adminRoutes);
app.use('/trades', tradesRoutes);
app.use('/rank', rankRoutes);
app.use('/inventory', inventoryRoutes);

app.use('/pokedex', pokedexRoutes);
app.use('/tower', towerRoutes);
app.use('/rift', riftRoutes);

// 404 Fallback for unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
