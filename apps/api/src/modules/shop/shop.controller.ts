import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ShopService } from './shop.service';


@injectable()
export class ShopController {
  constructor(private shopService: ShopService) {}

  getItems = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.shopService.getItems();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  };

  getMoves = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const moves = await this.shopService.getMoves();
      res.json({ success: true, data: moves });
    } catch (error) {
      next(error);
    }
  };

  buyItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId, quantity } = req.body;
      
      const trainerSave = await this.shopService.buyItem(req.user!.id, { itemId, quantity });
      
      res.json({ success: true, data: trainerSave });
    } catch (error) {
      next(error);
    }
  };

  buyBulk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items } = req.body;
      
      const trainerSave = await this.shopService.buyBulkItems(req.user!.id, { items });
      
      res.json({ success: true, data: trainerSave });
    } catch (error) {
      next(error);
    }
  };

  buyMove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { moveId } = req.body;
      
      const trainerSave = await this.shopService.buyMove(req.user!.id, { moveId });
      
      res.json({ success: true, data: trainerSave });
    } catch (error) {
      next(error);
    }
  };

  sellItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId, quantity } = req.body;

      const trainerSave = await this.shopService.sellItem(req.user!.id, { itemId, quantity });

      res.json({ success: true, data: trainerSave });
    } catch (error) {
      next(error);
    }
  };

  sellBulk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items } = req.body;

      const trainerSave = await this.shopService.sellBulkItems(req.user!.id, { items });

      res.json({ success: true, data: trainerSave });
    } catch (error) {
      next(error);
    }
  };
}
