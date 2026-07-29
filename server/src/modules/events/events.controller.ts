import { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service';
import { AuthRequest } from '../../common/middleware/require-auth';

export class EventsController {
  private service = new EventsService();

  getActiveEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const data = await this.service.getActiveEventForPlayer(authReq.user.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  claimReward = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { id } = req.params;
      const data = await this.service.claimReward(authReq.user.id, id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
