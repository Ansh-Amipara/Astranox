import { Router } from 'express';
import { useItemSchema } from '@astranox/types';
import { InventoryController } from './inventory.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { validate } from '../../core/middleware/validate';
import { container } from 'tsyringe';

export const inventoryRoutes = Router();
const controller = container.resolve(InventoryController);

inventoryRoutes.post('/use', requireAuth, validate(useItemSchema), controller.useItem);

