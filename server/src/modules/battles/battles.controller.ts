import { Request, Response, NextFunction } from 'express';
import { BattlesService } from './battles.service';
import { z } from 'zod';
import { ValidationError } from '../../common/errors/AppError';

export class BattlesController {
  private service: BattlesService;

  constructor() {
    this.service = new BattlesService();
  }

  engage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        zoneId: z.number().positive(),
      });
      const { zoneId } = schema.parse(req.body);
      const userId = (req as any).user.id;

      const result = await this.service.engageWild(userId, zoneId);

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
      const schema = z.object({
        action: z.string(), // e.g. "run", "move:Tackle"
      });
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
