import { Router } from 'express';
import { pokedexController } from './pokedex.controller';

const router = Router();

router.get('/', pokedexController.getAllSpecies);
router.get('/:id', pokedexController.getSpeciesById);

export default router;
