import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ASTRANOX_VERSION } from '@astranox/shared';

import { authRoutes } from './modules/auth/auth.routes';
import { trainersRoutes } from './modules/trainers/trainers.routes';
import { mapRoutes } from './modules/map/map.routes';
import { battlesRoutes } from './modules/battles/battles.routes';
import { shopRoutes } from './modules/shop/shop.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { errorHandler } from './common/middleware/error-handler';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Serve sprites publicly so the frontend can display them!
app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: ASTRANOX_VERSION });
});

app.use('/auth', authRoutes);
app.use('/trainers', trainersRoutes);
app.use('/map', mapRoutes);
app.use('/battles', battlesRoutes);
app.use('/shop', shopRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
