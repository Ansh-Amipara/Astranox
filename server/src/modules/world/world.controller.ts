import { Request, Response, NextFunction } from 'express';
import { WorldService } from './world.service';
import { z } from 'zod';

export class WorldController {
  private service: WorldService;

  constructor() {
    this.service = new WorldService();
  }

  getMacroLayout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const world = await this.service.getMacroLayout();
      res.json({ success: true, data: world });
    } catch (err) {
      next(err);
    }
  };

  getMapDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mapId = req.params.id;
      const map = await this.service.getMapDetails(mapId);
      res.json({ success: true, data: map });
    } catch (err) {
      next(err);
    }
  };

  travel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        targetMapId: z.string().uuid(),
        connectionId: z.string().uuid().optional()
      });
      const { targetMapId, connectionId } = schema.parse(req.body);
      const userId = (req as any).user.id;

      const updated = await this.service.travel(userId, targetMapId, connectionId);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  savePosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        mapId: z.string().uuid(),
        x: z.number(),
        y: z.number()
      });
      const { mapId, x, y } = schema.parse(req.body);
      const userId = (req as any).user.id;

      const updated = await this.service.savePosition(userId, mapId, x, y);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  getProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const progress = await this.service.getExplorationProgress(userId);
      res.json({ success: true, data: progress });
    } catch (err) {
      next(err);
    }
  };
}
