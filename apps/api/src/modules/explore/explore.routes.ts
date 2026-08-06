import { container } from 'tsyringe';
import { Router } from 'express';
import { ExploreController } from './explore.controller';
import { requireAuth } from '../../core/middleware/require-auth';

const router = Router();
const controller = container.resolve(ExploreController);

router.use(requireAuth);

router.post('/', controller.explore);

export default router;
