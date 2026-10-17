import { Router } from 'express';
import { container } from 'tsyringe';
import { ShopController } from './shop.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { requireFeatureFlag } from '../../core/middleware/require-feature-flag';
import { requireIdempotency } from '../../core/middleware/idempotency';
import { validate } from '../../core/middleware/validate';
import { purchaseShopItemSchema, buyItemSchema, buyMoveSchema, buyBulkSchema } from '@astranox/types';

const router = Router();
const controller = container.resolve(ShopController);

// Modern Shop Routes
router.get('/items', requireFeatureFlag('shop'), requireAuth, controller.getItems);
router.post(
  '/purchase',
  requireFeatureFlag('shop'),
  requireAuth,
  requireIdempotency(),
  validate(purchaseShopItemSchema),
  controller.purchase
);

// Moves Shop
router.get('/moves', requireFeatureFlag('shop'), requireAuth, controller.getMoves);
router.post('/moves/buy', requireFeatureFlag('shop'), requireAuth, validate(buyMoveSchema), controller.buyMove);

// Legacy / Sell Routes
router.post('/buy', requireFeatureFlag('shop'), requireAuth, validate(buyItemSchema), controller.buyItem);
router.post('/buy-bulk', requireFeatureFlag('shop'), requireAuth, validate(buyBulkSchema), controller.buyBulk);
router.post('/sell', requireFeatureFlag('shop'), requireAuth, validate(buyItemSchema), controller.sellItem);
router.post('/sell-bulk', requireFeatureFlag('shop'), requireAuth, validate(buyBulkSchema), controller.sellBulk);

export { router as shopRoutes };
