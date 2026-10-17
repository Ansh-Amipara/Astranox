import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AdminShopService } from './admin-shop.service';

@injectable()
export class AdminShopController {
  constructor(private shopService: AdminShopService) {}

  getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.shopService.getAdminShopItems({
        category: req.query.category as string,
        search: req.query.search as string,
        enabled: req.query.enabled as string,
      });
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || undefined;
      const updated = await this.shopService.updateShopItem(
        req.user!.id,
        req.params.key,
        req.body,
        requestId
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  bulkPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || undefined;
      const result = await this.shopService.applyBulkPriceUpdate(
        req.user!.id,
        req.body,
        requestId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await this.shopService.getShopPriceHistory(req.params.key);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };

  resetItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || undefined;
      const reset = await this.shopService.resetShopItem(
        req.user!.id,
        req.params.key,
        req.body.reason,
        requestId
      );
      res.json({ success: true, data: reset });
    } catch (error) {
      next(error);
    }
  };
}
