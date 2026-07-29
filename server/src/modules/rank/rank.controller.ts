import { Request, Response, NextFunction } from 'express';
import { rankService } from './rank.service';
import { AppError } from '../../core/errors/AppError';
import { BattlesService } from '../battles/battles.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RankController {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const status = await rankService.getRankStatus(userId);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async startExam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const result = await rankService.promoteRank(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const rankController = new RankController();
