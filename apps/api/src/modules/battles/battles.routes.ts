import { container } from 'tsyringe';
import { Router } from 'express';
import { engageCustomSchema, submitTurnSchema, arenaEncounterSchema } from '@astranox/types';
import { BattlesController } from './battles.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { battleActionLimiter } from '../../core/middleware/rate-limiter';
import { validate } from '../../core/middleware/validate';

export const battlesRoutes = Router();
const controller = container.resolve(BattlesController);

battlesRoutes.use(requireAuth);

battlesRoutes.post('/engage-custom', battleActionLimiter, validate(engageCustomSchema), controller.engageCustom);
battlesRoutes.get('/arena-trainers', controller.getArenaTrainers);
battlesRoutes.post('/arena-encounter', battleActionLimiter, validate(arenaEncounterSchema), controller.startArenaEncounter);
battlesRoutes.get('/available-species', controller.getAvailableSpecies);
battlesRoutes.get('/active', controller.getActive);
battlesRoutes.post('/turn', battleActionLimiter, validate(submitTurnSchema), controller.submitTurn);

