import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';

const prisma = new PrismaClient();

export class ShopService {
  async getItems() {
    return prisma.item.findMany({
      orderBy: { cost: 'asc' },
    });
  }

  async buyItem(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than zero.', 400);
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError('Item not found.', 404);
    }

    const trainer = await prisma.trainerSave.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new AppError('Trainer profile not found.', 404);
    }

    const totalCost = item.cost * quantity;

    if (trainer.money < totalCost) {
      throw new AppError('Not enough money.', 400);
    }

    // Execute in transaction
    await prisma.$transaction([
      prisma.trainerSave.update({
        where: { id: trainer.id },
        data: {
          money: { decrement: totalCost },
        },
      }),
      prisma.inventoryItem.upsert({
        where: {
          trainerId_itemId: {
            trainerId: trainer.id,
            itemId: item.id,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          trainerId: trainer.id,
          itemId: item.id,
          quantity: quantity,
        },
      }),
    ]);

    // Return the updated trainer with inventory
    return prisma.trainerSave.findUnique({
      where: { id: trainer.id },
      include: {
        inventory: {
          include: {
            item: true,
          }
        }
      },
    });
  }
}

export const shopService = new ShopService();
