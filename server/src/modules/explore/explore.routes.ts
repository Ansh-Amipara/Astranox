import { Router } from 'express';
import { ExploreController } from './explore.controller';
import { requireAuth } from '../../core/middleware/require-auth';

const router = Router();
const controller = new ExploreController();

router.use(requireAuth);

router.post('/', controller.explore);

export default router;
