import { Router } from 'express';
import { MapController } from './map.controller';
import { requireAuth } from '../../common/middleware/require-auth';

export const mapRoutes = Router();
const controller = new MapController();

mapRoutes.use(requireAuth);

mapRoutes.get('/zones', controller.getZones);
mapRoutes.post('/explore', controller.explore);
