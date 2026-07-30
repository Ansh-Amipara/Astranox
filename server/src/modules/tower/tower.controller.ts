import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { TowerService } from './tower.service';
import { z } from 'zod';
import { prisma } from '../../core/db/prisma';

@injectable()
export class TowerController {
  constructor(private service: TowerService) {}

  private async getTrainerId(userId: string) {
    const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!trainer) throw new Error('Trainer not found');
    return trainer.id;
  }

  getTowerState = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trainerId = await this.getTrainerId(req.user!.id);
      const state = await this.service.getState(trainerId);
      res.json({ success: true, data: state });
    } catch (error) {
      next(error);
    }
  };

  startFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trainerId = await this.getTrainerId(req.user!.id);
      const encounter = await this.service.generateNextFloorEncounter(trainerId);
      res.json({ success: true, data: encounter });
    } catch (error) {
      next(error);
    }
  };

  startBattle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trainerId = await this.getTrainerId(req.user!.id);
      const bodySchema = z.object({
        playerActivePokemonId: z.string().optional()
      });
      const { playerActivePokemonId } = bodySchema.parse(req.body);
      const battle = await this.service.startBattle(trainerId, playerActivePokemonId);
      res.json({ success: true, data: battle });
    } catch (error) {
      next(error);
    }
  };

  completeBattle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trainerId = await this.getTrainerId(req.user!.id);
      const bodySchema = z.object({
        result: z.enum(['WON', 'LOST'])
      });
      const { result } = bodySchema.parse(req.body);
      const newState = await this.service.completeBattle(trainerId, result);
      res.json({ success: true, data: newState });
    } catch (error) {
      next(error);
    }
  };

  skipFloors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trainerId = await this.getTrainerId(req.user!.id);
      const newState = await this.service.skipFloors(trainerId);
      res.json({ success: true, data: newState });
    } catch (error) {
      next(error);
    }
  };
}
