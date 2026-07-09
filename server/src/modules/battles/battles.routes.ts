import { Router } from 'express';
import { BattlesController } from './battles.controller';
import { requireAuth } from '../../common/middleware/require-auth';

export const battlesRoutes = Router();
const controller = new BattlesController();

battlesRoutes.use(requireAuth);

battlesRoutes.post('/engage', controller.engage);
battlesRoutes.get('/active', controller.getActive);
battlesRoutes.post('/turn', controller.submitTurn);
