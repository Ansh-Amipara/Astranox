import { Request, Response, NextFunction } from 'express';
import { pokedexService } from './pokedex.service';
import { NotFoundError } from '../../core/errors/AppError';

export class PokedexController {
  async getAllSpecies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
      const type = req.query.type as string | undefined;
      const category = req.query.category as string | undefined;

      const result = await pokedexService.getAllSpecies(page, limit, type, category);

      res.json({
        success: true,
        data: result.species,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSpeciesById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new NotFoundError('Invalid species ID');
      }

      const species = await pokedexService.getSpeciesById(id);
      
      if (!species) {
        throw new NotFoundError('Species not found');
      }

      res.json({
        success: true,
        data: species,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const pokedexController = new PokedexController();
