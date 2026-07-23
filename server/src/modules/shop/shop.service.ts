import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { ShopMapper } from './dto/mapper';
import { TrainerMapper } from '../trainers/dto/mapper';
import type { ShopItemDto } from './dto/response/ShopItemDto';
import type { TrainerSaveDto } from '../trainers/dto/response/TrainerSaveDto';
import type { BuyItemDto } from './dto/request/BuyItemDto';

const prisma = new PrismaClient();

export class ShopService {
  async getItems(): Promise<ShopItemDto[]> {
    const items = await prisma.item.findMany({
      where: {
        // @ts-ignore: Prisma client typings need a TS server restart to reflect the new category field
        category: {
          not: 'misc',
        }
      },
      orderBy: { cost: 'asc' },
    });
    return ShopMapper.toShopItemDtoList(items);
  }

  async buyItem(userId: string, dto: BuyItemDto): Promise<TrainerSaveDto> {
    const { itemId, quantity } = dto;
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

    if (trainer.astralCoins < totalCost) {
      throw new AppError('Not enough Astral Coins.', 400);
    }

    // Execute in transaction
    await prisma.$transaction([
      prisma.trainerSave.update({
        where: { id: trainer.id },
        data: {
          astralCoins: { decrement: totalCost },
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
    const updatedTrainer = await prisma.trainerSave.findUnique({
      where: { id: trainer.id },
      include: {
        inventory: {
          include: {
            item: true,
          }
        },
        party: {
          include: {
            species: { include: { type1: true, type2: true } },
            moves: { include: { move: { include: { type: true } } } }
          }
        }
      },
    });

    return TrainerMapper.toTrainerSaveDto(updatedTrainer!);
  }
}

export const shopService = new ShopService();
