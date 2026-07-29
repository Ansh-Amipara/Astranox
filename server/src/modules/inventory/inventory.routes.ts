import { Router } from 'express';
import { useItem } from './inventory.controller';
import { requireAuth } from '../../core/middleware/require-auth';

export const inventoryRoutes = Router();

inventoryRoutes.post('/use', requireAuth, useItem);
