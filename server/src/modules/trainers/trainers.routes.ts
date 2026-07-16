import { Router } from 'express';
import { TrainersController } from './trainers.controller';
import { requireAuth } from '../../common/middleware/require-auth';
import { gameplayLimiter } from '../../common/middleware/rate-limiter';

export const trainersRoutes = Router();
const controller = new TrainersController();

trainersRoutes.use(requireAuth);

trainersRoutes.get('/me', controller.getMe);
trainersRoutes.post('/starter', gameplayLimiter, controller.pickStarter);
trainersRoutes.get('/box/:boxNumber', controller.getBox);
trainersRoutes.post('/swap', gameplayLimiter, controller.swapSlots);
trainersRoutes.get('/moves', controller.getAllMoves);
trainersRoutes.patch('/party/:pokemonId/moves', gameplayLimiter, controller.changeMoves);
trainersRoutes.delete('/:pokemonId', gameplayLimiter, controller.releasePokemon);
trainersRoutes.post('/party/:pokemonId/evolve', gameplayLimiter, controller.evolvePokemon);
trainersRoutes.post('/party/:pokemonId/boost-potential', gameplayLimiter, controller.boostPotential);
