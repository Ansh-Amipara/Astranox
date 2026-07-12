import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth, requireAdmin } from '../../common/middleware/require-auth';

const router = Router();
const controller = new AdminController();

// Apply requireAuth and requireAdmin to all routes in this file
router.use(requireAuth);
router.use(requireAdmin);

router.get('/users', controller.getAllUsers);
router.get('/species', controller.getAllSpecies);
router.get('/users/:id/pokemon', controller.getUserPokemon);
router.post('/users/:id/money', controller.addMoney);
router.post('/users/:id/pokemon', controller.addPokemon);
router.post('/users/:id/pokemon', controller.addPokemon);
export { router as adminRoutes };
