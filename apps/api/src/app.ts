import 'reflect-metadata';
import { env } from './config/env';
import { initSentry } from './config/sentry';
import * as Sentry from '@sentry/node';

// Initialize Sentry before everything else
initSentry();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ASTRANOX_VERSION } from '@astranox/shared';
import cookieParser from 'cookie-parser';

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
import exploreRoutes from './modules/explore/explore.routes';
import { errorHandler } from './core/middleware/error-handler';
import { httpLogger } from './core/middleware/http-logger';
import { marketplaceRoutes } from './modules/marketplace/marketplace.routes';
import eventsRoutes from './modules/events/events.routes';

const app = express();

// The request handler must be the first middleware on the app
Sentry.setupExpressErrorHandler(app);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CORS_ORIGIN === 'true' ? true : env.CORS_ORIGIN, credentials: true }));
app.use(httpLogger);
app.use(express.json());
app.use(cookieParser());

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
app.use('/marketplace', marketplaceRoutes);
app.use('/explore', exploreRoutes);
app.use('/events', eventsRoutes);

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

export { app };
