import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ASTRANOX_VERSION } from '@astranox/shared';

import { authRoutes } from './modules/auth/auth.routes';
import { trainersRoutes } from './modules/trainers/trainers.routes';
import { mapRoutes } from './modules/map/map.routes';
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

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
