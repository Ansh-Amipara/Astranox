import { container } from 'tsyringe';
import { Router } from 'express';
import { TrainersController } from './trainers.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { gameplayLimiter } from '../../core/middleware/rate-limiter';
import { validate } from '../../core/middleware/validate';
import {
  pickStarterSchema,

  pokemonIdParamSchema,
  addToPartySchema,
  swapSlotsSchema,
  changeMovesSchema,
  evolvePokemonSchema,
  boostPotentialSchema,
  boostIvSchema,
  distributeXpSchema
} from './trainers.schema';

export const trainersRoutes = Router();
const controller = container.resolve(TrainersController);

trainersRoutes.use(requireAuth);

trainersRoutes.get('/me', controller.getMe);
trainersRoutes.post('/starter', gameplayLimiter, validate(pickStarterSchema), controller.pickStarter);

trainersRoutes.get('/pokemon', controller.getAllPokemon);
trainersRoutes.get('/pokemon/:pokemonId', validate(pokemonIdParamSchema), controller.getPokemonById);
trainersRoutes.post('/party/:pokemonId/remove', gameplayLimiter, validate(pokemonIdParamSchema), controller.removeFromParty);
trainersRoutes.post('/party/:pokemonId/add', gameplayLimiter, validate(addToPartySchema), controller.addToParty);
trainersRoutes.post('/swap', gameplayLimiter, validate(swapSlotsSchema), controller.swapSlots);
trainersRoutes.get('/moves', controller.getAllMoves);
trainersRoutes.patch('/party/:pokemonId/moves', gameplayLimiter, validate(changeMovesSchema), controller.changeMoves);
trainersRoutes.post('/party/:pokemonId/smelt', gameplayLimiter, validate(pokemonIdParamSchema), controller.smeltPokemon);
trainersRoutes.post('/party/:pokemonId/evolve', gameplayLimiter, validate(evolvePokemonSchema), controller.evolvePokemon);
trainersRoutes.post('/party/:pokemonId/devolve', gameplayLimiter, validate(pokemonIdParamSchema), controller.devolvePokemon);
trainersRoutes.post('/party/:pokemonId/boost-potential', gameplayLimiter, validate(boostPotentialSchema), controller.boostPotential);
trainersRoutes.post('/party/:pokemonId/boost-ivs', gameplayLimiter, validate(boostIvSchema), controller.boostIv);
trainersRoutes.post('/distribute-xp', gameplayLimiter, validate(distributeXpSchema), controller.distributeXp);
