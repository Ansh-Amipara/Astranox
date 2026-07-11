import { Router } from 'express';
import { NpcsController } from './npcs.controller';
import { requireAuth } from '../../common/middleware/require-auth';

export const npcsRoutes = Router();
const controller = new NpcsController();

npcsRoutes.use(requireAuth);

npcsRoutes.get('/', controller.list);
npcsRoutes.post('/:id/challenge', controller.challenge);
