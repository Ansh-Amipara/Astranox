import { container } from 'tsyringe';
import { Router } from 'express';
import { RiftController } from './rift.controller';
import { requireAuth } from '../../core/middleware/require-auth';

export const riftRoutes = Router();
const controller = container.resolve(RiftController);

riftRoutes.use(requireAuth);

riftRoutes.get('/', controller.getState);
riftRoutes.post('/start', controller.startRun);
riftRoutes.post('/encounter', controller.generateEncounter);
riftRoutes.post('/complete', controller.completeEncounter);
riftRoutes.post('/abandon', controller.abandonRun);
