import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AdminUserService } from './admin-user.service';

@injectable()
export class AdminUserController {
  constructor(private userService: AdminUserService) {}

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const search = req.query.search as string;

      const result = await this.userService.getUsers(page, limit, search);
      res.json({ success: true, data: result.items, meta: result.meta });
    } catch (error) {
      next(error);
    }
  };

  getUserDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const details = await this.userService.getUserDetail(req.params.id);
      res.json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  };

  banUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || undefined;
      const result = await this.userService.banUser(req.user!.id, req.params.id, req.body, requestId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  unbanUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || undefined;
      const result = await this.userService.unbanUser(req.user!.id, req.params.id, req.body, requestId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  grantCurrency = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || undefined;
      const result = await this.userService.grantCurrency(req.user!.id, req.params.id, req.body, requestId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  grantItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || undefined;
      const result = await this.userService.grantItem(req.user!.id, req.params.id, req.body, requestId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
