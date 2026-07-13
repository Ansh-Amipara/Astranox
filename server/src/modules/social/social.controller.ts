import { Request, Response, NextFunction } from 'express';
import { SocialService } from './social.service';
import { z } from 'zod';
import { ValidationError } from '../../common/errors/AppError';

export class SocialController {
  private service: SocialService;

  constructor() {
    this.service = new SocialService();
  }

  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      const userId = (req as any).user.id;
      const users = await this.service.searchUsers(query, userId);
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  };

  getFriendsList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const friends = await this.service.getFriendsList(userId);
      res.json({ success: true, data: friends });
    } catch (err) {
      next(err);
    }
  };

  sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({ username: z.string().min(1) });
      const { username } = schema.parse(req.body);
      const userId = (req as any).user.id;

      const friendship = await this.service.sendFriendRequest(userId, username);
      res.json({ success: true, data: friendship });
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(new ValidationError('Invalid input parameters'));
        return;
      }
      next(err);
    }
  };

  acceptFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const friendshipId = req.params.id;
      const userId = (req as any).user.id;

      const friendship = await this.service.acceptFriendRequest(userId, friendshipId);
      res.json({ success: true, data: friendship });
    } catch (err) {
      next(err);
    }
  };
}
