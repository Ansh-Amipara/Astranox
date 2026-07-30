import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { RankService } from './rank.service';
import { AppError } from '../../core/errors/AppError';
import { BattlesService } from '../battles/battles.service';

@injectable()
export class RankController {
  constructor(private rankService: RankService) {}

  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const status = await this.rankService.getRankStatus(userId);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  };

  startExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const result = await this.rankService.promoteRank(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
