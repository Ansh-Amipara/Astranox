import { container } from 'tsyringe';
import { Router } from 'express';
import { exploreSchema } from '@astranox/types';
import { ExploreController } from './explore.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { validate } from '../../core/middleware/validate';

const router = Router();
const controller = container.resolve(ExploreController);

router.use(requireAuth);

router.post('/', validate(exploreSchema), controller.explore);

export default router;

