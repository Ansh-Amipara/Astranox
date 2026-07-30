import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { ShopService } from './shop.service';
import { z } from 'zod';

const buyItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive(),
});

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

  buyItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId, quantity } = buyItemSchema.parse(req.body);
      
      const trainerSave = await this.shopService.buyItem(req.user!.id, { itemId, quantity });
      
      res.json({ success: true, data: trainerSave });
    } catch (error) {
      next(error);
    }
  };

  sellItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId, quantity } = buyItemSchema.parse(req.body);

      const trainerSave = await this.shopService.sellItem(req.user!.id, { itemId, quantity });

      res.json({ success: true, data: trainerSave });
    } catch (error) {
      next(error);
    }
  };
}
