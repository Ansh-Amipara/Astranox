import { container } from 'tsyringe';
import { Router } from 'express';
import { TradesController } from './trades.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { requireFlag } from '../../core/middleware/require-feature-flag';
import { validate } from '../../core/middleware/validate';
import { requestTradeSchema } from './trades.schema';
const router = Router();
const controller = container.resolve(TradesController);

router.use(requireFlag('trading'));
router.use(requireAuth);

router.post('/pokemon/:id/toggle-trade', controller.toggleForTrade);
router.get('/users/:userId/tradeable', controller.getTradeablePokemon);

router.get('/incoming', controller.getIncomingTrades);
router.get('/outgoing', controller.getOutgoingTrades);

router.post('/request', validate(requestTradeSchema), controller.requestTrade);
router.post('/accept/:id', controller.acceptTrade);
router.post('/reject/:id', controller.rejectTrade);

export const tradesRoutes = router;
