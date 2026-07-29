import { Router } from 'express';
import { EventsController } from './events.controller';
import { requireAuth } from '../../core/middleware/require-auth';

const eventsRoutes = Router();
const controller = new EventsController();

eventsRoutes.get('/active', requireAuth, controller.getActiveEvent);
eventsRoutes.post('/:id/claim', requireAuth, controller.claimReward);

export default eventsRoutes;
