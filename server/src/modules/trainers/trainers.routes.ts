import { Router } from 'express';
import { TrainersController } from './trainers.controller';
import { requireAuth } from '../../common/middleware/require-auth';

export const trainersRoutes = Router();
const controller = new TrainersController();

trainersRoutes.use(requireAuth);

trainersRoutes.get('/me', controller.getMe);
trainersRoutes.post('/starter', controller.pickStarter);
trainersRoutes.get('/box/:boxNumber', controller.getBox);
trainersRoutes.post('/swap', controller.swapSlots);
