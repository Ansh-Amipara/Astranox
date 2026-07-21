import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../common/middleware/require-auth';
import { authLimiter } from '../../common/middleware/rate-limiter';

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);
router.post('/refresh', authLimiter, controller.refresh);
router.post('/logout', requireAuth, controller.logout);
router.post('/update-profile', requireAuth, authLimiter, controller.updateProfile);

export { router as authRoutes };
