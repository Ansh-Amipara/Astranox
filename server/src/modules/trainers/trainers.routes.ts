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
trainersRoutes.get('/pokemon', controller.getAllPokemon);
trainersRoutes.post('/party/:pokemonId/remove', gameplayLimiter, controller.removeFromParty);
trainersRoutes.post('/party/:pokemonId/add', gameplayLimiter, controller.addToParty);
trainersRoutes.post('/swap', gameplayLimiter, controller.swapSlots);
trainersRoutes.get('/moves', controller.getAllMoves);
trainersRoutes.patch('/party/:pokemonId/moves', gameplayLimiter, controller.changeMoves);
trainersRoutes.post('/party/:pokemonId/smelt', gameplayLimiter, controller.smeltPokemon);
trainersRoutes.post('/party/:pokemonId/evolve', gameplayLimiter, controller.evolvePokemon);
trainersRoutes.post('/party/:pokemonId/boost-potential', gameplayLimiter, controller.boostPotential);
trainersRoutes.post('/party/:pokemonId/boost-ivs', gameplayLimiter, controller.boostIv);
trainersRoutes.post('/distribute-xp', gameplayLimiter, controller.distributeXp);
