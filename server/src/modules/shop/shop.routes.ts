import { Router } from 'express';
import { shopController } from './shop.controller';
import { requireAuth } from '../../common/middleware/require-auth';

const router = Router();

router.get('/items', requireAuth, shopController.getItems.bind(shopController));
router.post('/buy', requireAuth, shopController.buyItem.bind(shopController));
router.post('/sell', requireAuth, shopController.sellItem.bind(shopController));

export { router as shopRoutes };
