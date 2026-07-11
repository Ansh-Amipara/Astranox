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
router.get('/maps', controller.getAllMaps);
router.post('/maps/:id/spawns', controller.addSpawn);
router.delete('/spawns/:id', controller.removeSpawn);
export { router as adminRoutes };
