import { Router } from 'express';
import { WorldController } from './world.controller';
import { requireAuth } from '../../common/middleware/require-auth';

const router = Router();
const controller = new WorldController();

router.get('/', controller.getMacroLayout);
router.get('/map/:id', controller.getMapDetails);

// Protected routes
router.post('/travel', requireAuth, controller.travel);
router.post('/position', requireAuth, controller.savePosition);
router.get('/progress', requireAuth, controller.getProgress);

export { router as worldRoutes };
