import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AdminDungeonService } from './admin-dungeon.service';

@injectable()
export class AdminDungeonController {
  constructor(private service: AdminDungeonService) {}

  getFloors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dungeonType, difficulty, isArchived } = req.query as Record<string, string>;
      const floors = await this.service.getFloorRules({
        dungeonType: dungeonType as any,
        difficulty: difficulty as any,
        isArchived,
      });
      res.json({ success: true, data: floors });
    } catch (err) {
      next(err);
    }
  };

  createFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const floor = await this.service.createFloorRule(adminId, req.body, requestId);
      res.status(201).json({ success: true, data: floor });
    } catch (err) {
      next(err);
    }
  };

  updateFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { id } = req.params;
      const floor = await this.service.updateFloorRule(adminId, id, req.body, requestId);
      res.json({ success: true, data: floor });
    } catch (err) {
      next(err);
    }
  };

  archiveFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { id } = req.params;
      const { reason } = req.body;
      const floor = await this.service.archiveFloorRule(adminId, id, reason, requestId);
      res.json({ success: true, data: floor });
    } catch (err) {
      next(err);
    }
  };

  unarchiveFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { id } = req.params;
      const { reason } = req.body;
      const floor = await this.service.unarchiveFloorRule(adminId, id, reason, requestId);
      res.json({ success: true, data: floor });
    } catch (err) {
      next(err);
    }
  };
}
