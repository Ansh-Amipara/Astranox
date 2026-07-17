import { Request, Response, NextFunction } from 'express';
import { RealmsService } from './realms.service';

export class RealmsController {
  private service: RealmsService;

  constructor() {
    this.service = new RealmsService();
  }

  listRealms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const realms = await this.service.getUnlockedRealms(req.user!.id);
      res.json({ success: true, data: realms });
    } catch (e) {
      next(e);
    }
  };

  getRealm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const realm = await this.service.getRealmById(req.user!.id, id);
      res.json({ success: true, data: realm });
    } catch (e) {
      next(e);
    }
  };

  exploreRealm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.service.exploreRealm(req.user!.id, id);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  };
}
