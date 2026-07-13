import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth, requireAdmin } from '../../common/middleware/require-auth';
import { validate } from '../../common/middleware/validate';
import { addMoneySchema, addPokemonSchema } from './admin.schema';

const router = Router();
const controller = new AdminController();

// Apply requireAuth and requireAdmin to all routes in this file
router.use(requireAuth);
router.use(requireAdmin);

router.get('/users', controller.getAllUsers);
router.get('/species', controller.getAllSpecies);
router.get('/users/:id/pokemon', controller.getUserPokemon);
router.post('/users/:id/money', validate(addMoneySchema), controller.addMoney);
router.post('/users/:id/pokemon', validate(addPokemonSchema), controller.addPokemon);
export { router as adminRoutes };
