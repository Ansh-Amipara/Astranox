import { Router } from 'express';
import { BattlesController } from './battles.controller';
import { requireAuth } from '../../common/middleware/require-auth';
import { gameplayLimiter } from '../../common/middleware/rate-limiter';

export const battlesRoutes = Router();
const controller = new BattlesController();

battlesRoutes.use(requireAuth);

battlesRoutes.post('/engage-custom', gameplayLimiter, controller.engageCustom);
battlesRoutes.get('/available-species', controller.getAvailableSpecies);
battlesRoutes.get('/active', controller.getActive);
battlesRoutes.post('/turn', gameplayLimiter, controller.submitTurn);
