import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { BattlesService } from './battles.service';
import { ValidationError } from '../../core/errors/AppError';
import type { EngageCustomDto } from './dto/request/EngageCustomDto';
import type { SubmitTurnDto } from './dto/request/SubmitTurnDto';

@injectable()
export class BattlesController {
  constructor(private service: BattlesService) {}

  getArenaTrainers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const trainers = await this.service.getArenaTrainers();
      res.json({ success: true, data: trainers });
    } catch (err) {
      next(err);
    }
  };

  startArenaEncounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } = req.body;
      const userId = (req as any).user.id;

      const result = await this.service.startArenaEncounter(userId, trainerId);

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  };

  engageCustom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { speciesId, level, battleType } = req.body;
      const userId = (req as any).user.id;

      const result = await this.service.startCustomEncounter(userId, { speciesId, level, battleType });

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  };

  startRealmEncounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { realmId } = req.body;
      const userId = (req as any).user.id;

      const session = await this.service.startRealmEncounter(userId, realmId);

      res.json({
        success: true,
        data: session
      });
    } catch (err) {
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
      const { action } = req.body;
      const userId = (req as any).user.id;

      const result = await this.service.submitTurn(userId, { action });

      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  };
}
