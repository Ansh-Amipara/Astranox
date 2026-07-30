import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { InventoryService } from './inventory.service';
import { AppError } from '../../core/errors/AppError';
import { prisma } from '../../core/db/prisma';

@injectable()
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  useItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trainer = await prisma.trainerSave.findUnique({ where: { userId: req.user!.id } });
      if (!trainer) throw new AppError('Trainer not found', 404);

      const { itemId, targetPokemonId, quantity } = req.body;

      if (!itemId) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'itemId is required' } });
      }

      const useQuantity = quantity ? parseInt(quantity) : 1;
      if (useQuantity < 1) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'quantity must be at least 1' } });
      }

      const result = await this.inventoryService.useItem(trainer.id, itemId, targetPokemonId, useQuantity);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
