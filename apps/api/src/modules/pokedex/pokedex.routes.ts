import { container } from 'tsyringe';
import { Router } from 'express';
import { PokedexController } from './pokedex.controller';

const router = Router();
const controller = container.resolve(PokedexController);

router.get('/species', controller.getAllSpecies);
router.get('/species/:id', controller.getSpeciesById);

export default router;
