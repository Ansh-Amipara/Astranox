import { container } from 'tsyringe';
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { requireFlag } from '../../core/middleware/require-feature-flag';
import { authLimiter } from '../../core/middleware/rate-limiter';
import { validate } from '../../core/middleware/validate';
import { registerRouteSchema, loginRouteSchema, updateProfileRouteSchema } from './auth.schema';

const router = Router();
const controller = container.resolve(AuthController);

router.post('/register', requireFlag('newRegistrations'), authLimiter, validate(registerRouteSchema), controller.register);
router.post('/login', authLimiter, validate(loginRouteSchema), controller.login);
router.post('/refresh', authLimiter, controller.refresh);
router.post('/logout', requireAuth, controller.logout);
router.post('/logout-all', requireAuth, controller.logoutAll);
router.post('/update-profile', requireAuth, authLimiter, validate(updateProfileRouteSchema), controller.updateProfile);
router.get('/profile', requireAuth, controller.getProfile);

export { router as authRoutes };
