import { Router } from 'express';
import { RankController } from './rank.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { container } from 'tsyringe';

const router = Router();
const controller = container.resolve(RankController);

router.use(requireAuth);

router.get('/status', controller.getStatus);
router.post('/exam', controller.startExam);

export const rankRoutes = router;
