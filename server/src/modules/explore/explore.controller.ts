import { Request, Response, NextFunction } from 'express';
import { ExploreService } from './explore.service';
import { ExploreLocation } from './config/coinRewards.config';
import { ValidationError } from '../../common/errors/AppError';

export class ExploreController {
  private service = new ExploreService();

  explore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { location } = req.body;

      if (!location) {
        throw new ValidationError('Location is required.');
      }

      const validLocations: ExploreLocation[] = [
        'PLAINS', 'FOREST', 'VOLCANO', 'OCEAN', 'FROZEN_PEAKS', 
        'DESERT', 'MOUNTAIN', 'HAUNTED_RUINS', 'FAIRY_GARDEN', 
        'SWAMP', 'ANCIENT_TEMPLE', 'CRYSTAL_CAVE', 'SKY_ISLANDS',
        'ALOLA_REGION', 'HISUI_REGION', 'GALAR_REGION', 'PALDEA_REGION'
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
