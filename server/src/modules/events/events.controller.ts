import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service';

interface AuthRequest extends Request {
  user: { id: string; role: 'USER' | 'ADMIN'; username: string; email: string };
}
@injectable()
export class EventsController {
  constructor(private service: EventsService) {}

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
