import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ExploreService } from './explore.service';
import { ExploreLocation } from './config/coinRewards.config';
import { ValidationError } from '../../core/errors/AppError';

@injectable()
export class ExploreController {
  constructor(private service: ExploreService) {}

  explore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { location } = req.body;

      if (!location) {
        throw new ValidationError('Location is required.');
      }

      const validLocations: ExploreLocation[] = [
        'NORMAL_REGION', 'FIRE_REGION', 'WATER_REGION', 'GRASS_REGION',
        'ELECTRIC_REGION', 'ICE_REGION', 'FIGHTING_REGION', 'POISON_REGION',
        'GROUND_REGION', 'FLYING_REGION', 'PSYCHIC_REGION', 'BUG_REGION',
        'ROCK_REGION', 'GHOST_REGION', 'DRAGON_REGION', 'DARK_REGION',
        'STEEL_REGION', 'FAIRY_REGION'
      ];

      if (!validLocations.includes(location as ExploreLocation)) {
        throw new ValidationError('Invalid location provided.');
      }

      const result = await this.service.explore(userId, location as ExploreLocation);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  };
}
