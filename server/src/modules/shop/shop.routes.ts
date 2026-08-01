import { Router } from 'express';
import { ShopController } from './shop.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { container } from 'tsyringe';
import { validate } from '../../core/middleware/validate';
import { buyItemSchema, buyMoveSchema, buyBulkSchema } from './shop.schema';

const router = Router();
const controller = container.resolve(ShopController);

router.get('/items', requireAuth, controller.getItems);
router.post('/buy', requireAuth, validate(buyItemSchema), controller.buyItem);
router.post('/buy-bulk', requireAuth, validate(buyBulkSchema), controller.buyBulk);
router.post('/sell', requireAuth, validate(buyItemSchema), controller.sellItem);
router.post('/sell-bulk', requireAuth, validate(buyBulkSchema), controller.sellBulk);

router.get('/moves', requireAuth, controller.getMoves);
router.post('/moves/buy', requireAuth, validate(buyMoveSchema), controller.buyMove);

export { router as shopRoutes };
