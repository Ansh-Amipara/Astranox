import { Request, Response, NextFunction } from 'express';
import { shopService } from './shop.service';
import { z } from 'zod';

const buyItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive(),
});

export class ShopController {
  async getItems(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await shopService.getItems();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async buyItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId, quantity } = buyItemSchema.parse(req.body);
      
      const trainerSave = await shopService.buyItem(req.user!.id, { itemId, quantity });
      
      res.json({ success: true, data: trainerSave });
    } catch (error) {
      next(error);
    }
  }
}

export const shopController = new ShopController();
