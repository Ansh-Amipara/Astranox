import { container } from 'tsyringe';
import { Router } from 'express';
import { claimEventRewardParamSchema } from '@astranox/types';
import { EventsController } from './events.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { validate } from '../../core/middleware/validate';

const eventsRoutes = Router();
const controller = container.resolve(EventsController);

eventsRoutes.get('/active', requireAuth, controller.getActiveEvent);
eventsRoutes.get('/history', requireAuth, controller.getEventHistory);
eventsRoutes.post('/:id/claim', requireAuth, validate({ params: claimEventRewardParamSchema }), controller.claimReward);

export default eventsRoutes;

