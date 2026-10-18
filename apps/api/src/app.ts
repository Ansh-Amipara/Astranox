import 'reflect-metadata';
import { env } from './config/env';
import { initSentry } from './config/sentry';
import * as Sentry from '@sentry/node';

// Initialize Sentry before everything else
initSentry();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ASTRANOX_VERSION } from '@astranox/constants';
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
import { ForbiddenError } from './core/errors/AppError';
import { requestIdMiddleware } from './core/middleware/request-id';
import { httpLogger } from './core/middleware/http-logger';
import { verifyCsrf } from './core/middleware/csrf';
import { marketplaceRoutes } from './modules/marketplace/marketplace.routes';
import eventsRoutes from './modules/events/events.routes';
import { flagsRoutes } from './modules/flags/flags.routes';

const app = express();

// Configure trust proxy for ingress / load balancers
app.set('trust proxy', env.TRUST_PROXY === 'true' ? true : Number(env.TRUST_PROXY) || 1);

// The request handler must be the first middleware on the app
Sentry.setupExpressErrorHandler(app);

// Content Security Policy & Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://raw.githubusercontent.com',
        ],
        connectSrc: [
          "'self'",
          ...env.allowedOrigins,
          'ws:',
          'wss:',
        ],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
  })
);

// Dynamic CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const isAllowed = env.allowedOrigins.some(
        (allowed) => allowed === origin || allowed === '*'
      );
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new ForbiddenError(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  })
);

app.use(requestIdMiddleware);
app.use(httpLogger);
app.use(express.json());
app.use(cookieParser());
app.use(verifyCsrf);

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
app.use('/flags', flagsRoutes);

// 404 Fallback for unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

app.use(errorHandler);

export { app };
