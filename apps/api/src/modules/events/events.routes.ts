import { container } from 'tsyringe';
import { Router } from 'express';
import { EventsController } from './events.controller';
import { requireAuth } from '../../core/middleware/require-auth';

const eventsRoutes = Router();
const controller = container.resolve(EventsController);

eventsRoutes.get('/active', requireAuth, controller.getActiveEvent);
eventsRoutes.get('/history', requireAuth, controller.getEventHistory);
eventsRoutes.post('/:id/claim', requireAuth, controller.claimReward);

export default eventsRoutes;
