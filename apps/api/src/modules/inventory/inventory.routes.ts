import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { container } from 'tsyringe';

export const inventoryRoutes = Router();
const controller = container.resolve(InventoryController);

inventoryRoutes.post('/use', requireAuth, controller.useItem);
