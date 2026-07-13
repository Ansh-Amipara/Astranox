import { Router } from 'express';
import { TradesController } from './trades.controller';
import { requireAuth } from '../../common/middleware/require-auth';

const router = Router();
const controller = new TradesController();

router.use(requireAuth);

router.post('/pokemon/:id/toggle-trade', controller.toggleForTrade);
router.get('/users/:userId/tradeable', controller.getTradeablePokemon);

router.get('/incoming', controller.getIncomingTrades);
router.get('/outgoing', controller.getOutgoingTrades);

router.post('/request', controller.requestTrade);
router.post('/accept/:id', controller.acceptTrade);
router.post('/reject/:id', controller.rejectTrade);

export const tradesRoutes = router;
