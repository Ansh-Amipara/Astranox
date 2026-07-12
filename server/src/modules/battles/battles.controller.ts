import { Request, Response, NextFunction } from 'express';
import { BattlesService } from './battles.service';
import { z } from 'zod';
import { ValidationError } from '../../common/errors/AppError';

const battleActionSchema = z.union([
  z.literal('run'),
  z.string().regex(/^move:[1-9]\d*$/, 'Invalid move action'),
  z.string().regex(/^switch:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, 'Invalid switch action'),
  z.enum([
    'item:poke-ball',
    'item:great-ball',
    'item:ultra-ball',
    'item:luxury-ball',
    'item:master-ball'
  ])
]);

export class BattlesController {
  private service: BattlesService;

  constructor() {
    this.service = new BattlesService();
  }

  engageCustom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        speciesId: z.number().positive(),
        level: z.number().min(1).max(100),
      });
      const { speciesId, level } = schema.parse(req.body);
      const userId = (req as any).user.id;

      const result = await this.service.startCustomEncounter(userId, speciesId, level);

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(new ValidationError('Invalid input parameters'));
        return;
      }
      next(err);
    }
  };

  getAvailableSpecies = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const species = await this.service.getAvailableSpecies();
      res.json({ success: true, data: species });
    } catch (err) {
      next(err);
    }
  };

  getActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const session = await this.service.getActiveSession(userId);

      res.json({
        success: true,
        data: session
      });
    } catch (err) {
      next(err);
    }
  };

  submitTurn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({ action: battleActionSchema });
      const { action } = schema.parse(req.body);
      const userId = (req as any).user.id;

      const result = await this.service.submitTurn(userId, action);

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(new ValidationError('Invalid input parameters'));
        return;
      }
      next(err);
    }
  };
}
