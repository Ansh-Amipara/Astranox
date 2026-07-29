import { Router } from 'express';
import { RiftController } from './rift.controller';
import { requireAuth } from '../../core/middleware/require-auth';

export const riftRoutes = Router();
const controller = new RiftController();

riftRoutes.use(requireAuth);

riftRoutes.get('/', controller.getState);
riftRoutes.post('/start', controller.startRun);
riftRoutes.post('/encounter', controller.generateEncounter);
riftRoutes.post('/complete', controller.completeEncounter);
riftRoutes.post('/abandon', controller.abandonRun);
