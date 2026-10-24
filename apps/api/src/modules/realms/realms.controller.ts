import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { RealmsService } from './realms.service';

@injectable()
export class RealmsController {
  constructor(private service: RealmsService) {}

  listRealms = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listRealms();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getRealmDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { realmId } = req.params;
      const data = await this.service.getRealmDetail(userId, realmId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  searchRealm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const realmId = req.params.realmId || req.body.realmId;
      const data = await this.service.searchRealm(userId, realmId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
