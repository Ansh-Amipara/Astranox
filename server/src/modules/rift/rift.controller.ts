import { Request, Response, NextFunction } from 'express';
import { RiftService } from './rift.service';

export class RiftController {
  private service = new RiftService();

  getState = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getRiftState(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  startRun = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rank, difficulty } = req.body;
      const data = await this.service.startRun(req.user!.id, rank, difficulty);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  generateEncounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.generateEncounter(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  completeEncounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.completeEncounter(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  abandonRun = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.abandonRun(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };
}
