import { env } from './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ASTRANOX_VERSION } from '@astranox/shared';

import { authRoutes } from './modules/auth/auth.routes';
import { trainersRoutes } from './modules/trainers/trainers.routes';
import { battlesRoutes } from './modules/battles/battles.routes';
import { shopRoutes } from './modules/shop/shop.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { npcsRoutes } from './modules/npcs/npcs.routes';
import { worldRoutes } from './modules/world/world.routes';
import { errorHandler } from './common/middleware/error-handler';
import { httpLogger } from './common/middleware/http-logger';
import cookieParser from 'cookie-parser';
import { logger } from './config/logger';

const app = express();
const port = env.PORT;

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === 'true' ? true : env.CORS_ORIGIN, credentials: true }));
app.use(httpLogger);
app.use(express.json());
app.use(cookieParser());

// Serve sprites publicly so the frontend can display them!
app.use(express.static('public'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: ASTRANOX_VERSION });
});

app.use('/auth', authRoutes);
app.use('/trainers', trainersRoutes);
app.use('/battles', battlesRoutes);
app.use('/shop', shopRoutes);
app.use('/admin', adminRoutes);
app.use('/npcs', npcsRoutes);
app.use('/world', worldRoutes);

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
