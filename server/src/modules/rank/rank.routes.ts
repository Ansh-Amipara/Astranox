import { Router } from 'express';
import { rankController } from './rank.controller';
import { requireAuth } from '../../common/middleware/require-auth';

const router = Router();

router.use(requireAuth);

router.get('/status', rankController.getStatus);
router.post('/exam', rankController.startExam);

export const rankRoutes = router;
