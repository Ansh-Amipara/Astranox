import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../common/middleware/require-auth';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', requireAuth, controller.logout);

export { router as authRoutes };
