import { Request, Response, NextFunction } from 'express';
import { TrainersService } from './trainers.service';
import { ValidationError } from '../../common/errors/AppError';

export class TrainersController {
  private service: TrainersService;

  constructor() {
    this.service = new TrainersService();
  }

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const save = await this.service.getMySave(userId);
      res.json({ success: true, data: save });
    } catch (err) {
      next(err);
    }
  };

  pickStarter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { speciesId } = req.body;
      if (!speciesId || typeof speciesId !== 'number') {
        throw new ValidationError('speciesId must be a valid number');
      }

      const save = await this.service.pickStarter(userId, speciesId);
      res.json({ success: true, data: save });
    } catch (err) {
      next(err);
    }
  };
}
