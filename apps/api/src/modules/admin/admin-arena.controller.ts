import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AdminArenaService } from './admin-arena.service';

@injectable()
export class AdminArenaController {
  constructor(private service: AdminArenaService) {}

  getTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targetRank, search, isArchived, enabled } = req.query as Record<string, string>;
      const trainers = await this.service.getArenaTrainers({
        targetRank,
        search,
        isArchived,
        enabled,
      });
      res.json({ success: true, data: trainers });
    } catch (err) {
      next(err);
    }
  };

  createTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const trainer = await this.service.createArenaTrainer(adminId, req.body, requestId);
      res.status(201).json({ success: true, data: trainer });
    } catch (err) {
      next(err);
    }
  };

  updateTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { key } = req.params;
      const trainer = await this.service.updateArenaTrainer(adminId, key, req.body, requestId);
      res.json({ success: true, data: trainer });
    } catch (err) {
      next(err);
    }
  };

  archiveTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { key } = req.params;
      const { reason } = req.body;
      const trainer = await this.service.archiveArenaTrainer(adminId, key, reason, requestId);
      res.json({ success: true, data: trainer });
    } catch (err) {
      next(err);
    }
  };

  unarchiveTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { key } = req.params;
      const { reason } = req.body;
      const trainer = await this.service.unarchiveArenaTrainer(adminId, key, reason, requestId);
      res.json({ success: true, data: trainer });
    } catch (err) {
      next(err);
    }
  };

  getRanks = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const ranks = await this.service.getRankDefinitions();
      res.json({ success: true, data: ranks });
    } catch (err) {
      next(err);
    }
  };

  updateRank = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { rank } = req.params;
      const updated = await this.service.updateRankDefinition(adminId, rank, req.body, requestId);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };
}
