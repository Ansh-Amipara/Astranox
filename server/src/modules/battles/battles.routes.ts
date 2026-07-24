import { Router } from 'express';
import { BattlesController } from './battles.controller';
import { requireAuth } from '../../common/middleware/require-auth';
import { battleActionLimiter } from '../../common/middleware/rate-limiter';
import { validate } from '../../common/middleware/validate';
import { engageCustomSchema, submitTurnSchema } from './battles.schema';

export const battlesRoutes = Router();
const controller = new BattlesController();

battlesRoutes.use(requireAuth);

battlesRoutes.post('/engage-custom', battleActionLimiter, validate(engageCustomSchema), controller.engageCustom);
battlesRoutes.post('/realm-encounter', battleActionLimiter, controller.startRealmEncounter);

battlesRoutes.get('/arena-trainers', controller.getArenaTrainers);
battlesRoutes.post('/arena-encounter', battleActionLimiter, controller.startArenaEncounter);

battlesRoutes.get('/available-species', controller.getAvailableSpecies);
battlesRoutes.get('/active', controller.getActive);
battlesRoutes.post('/turn', battleActionLimiter, validate(submitTurnSchema), controller.submitTurn);
