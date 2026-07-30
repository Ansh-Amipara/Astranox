import { Router } from 'express';
import { ShopController } from './shop.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { container } from 'tsyringe';

const router = Router();
const controller = container.resolve(ShopController);

router.get('/items', requireAuth, controller.getItems);
router.post('/buy', requireAuth, controller.buyItem);
router.post('/sell', requireAuth, controller.sellItem);

export { router as shopRoutes };
