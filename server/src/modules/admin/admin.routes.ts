import { Router } from 'express';
import { AdminController } from './admin.controller';
import { AdminEventsController } from './admin-events.controller';
import { requireAuth, requireAdmin } from '../../common/middleware/require-auth';
import { validate } from '../../common/middleware/validate';
import { addMoneySchema, addPokemonSchema, editPokemonSchema } from './admin.schema';

const router = Router();
const controller = new AdminController();
const eventsController = new AdminEventsController();

// Apply requireAuth and requireAdmin to all routes in this file
router.use(requireAuth);
router.use(requireAdmin);

router.get('/users', controller.getAllUsers);
router.get('/species', controller.getAllSpecies);
router.get('/users/:id/pokemon', controller.getUserPokemon);
router.post('/users/:id/money', validate(addMoneySchema), controller.addMoney);
router.post('/users/:id/pokemon', validate(addPokemonSchema), controller.addPokemon);
router.put('/users/:id/pokemon/:pokemonId', validate(editPokemonSchema), controller.editPokemon);

// Events
router.get('/events', eventsController.getAllEvents);
router.post('/events', eventsController.createEvent);
router.put('/events/:id', eventsController.updateEvent);
router.delete('/events/:id', eventsController.deleteEvent);

export { router as adminRoutes };
