import { Request, Response, NextFunction } from 'express';
import { rankService } from './rank.service';
import { AppError } from '../../common/errors/AppError';
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

      const status = await rankService.getRankStatus(userId);
      if (!status.requirementMet || !status.nextRank) {
        throw new AppError('You do not meet the requirements for this rank exam.', 400);
      }

      // Map nextRank to Examiner Name
      const examinerNames: Record<string, string> = {
        E_RANK: 'E Rank Examiner',
        D_RANK: 'D Rank Examiner',
        C_RANK: 'C Rank Examiner',
        B_RANK: 'B Rank Examiner',
        A_RANK: 'A Rank Examiner',
        S_MINUS_RANK: 'A Rank Examiner',
        S_RANK: 'S Rank Examiner',
        S_PLUS_RANK: 'S+ Rank Examiner',
        SS_MINUS_RANK: 'S+ Rank Examiner',
        SS_RANK: 'SS Rank Examiner',
        SS_PLUS_RANK: 'SS+ Rank Examiner',
        SSS_MINUS_RANK: 'SS+ Rank Examiner',
        SSS_RANK: 'SSS Rank Examiner',
        SSS_PLUS_RANK: 'SSS+ Rank Examiner',
      };

      const examinerName = examinerNames[status.nextRank];
      if (!examinerName) throw new AppError('No examiner found for this rank', 500);

      const examiner = await prisma.npcTrainer.findFirst({
        where: { name: examinerName, trainerClass: 'Examiner' }
      });

      if (!examiner) {
        throw new AppError('Examiner NPC not found. Make sure to run the seed script.', 500);
      }

      // We call BattlesService to start an NPC battle using the existing method.
      // We will identify this as an exam battle inside the battle resolution logic by checking if the NPC is an Examiner.
      const battlesService = new BattlesService();
      const battleData = await battlesService.engageNpc(userId, examiner.id);
      
      res.json({ success: true, data: battleData });
    } catch (error) {
      next(error);
    }
  }
}

export const rankController = new RankController();
