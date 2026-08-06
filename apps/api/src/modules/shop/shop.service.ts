import { injectable } from 'tsyringe';
import { AppError } from '../../core/errors/AppError';
import { ShopMapper } from './dto/mapper';
import { TrainerMapper } from '../trainers/dto/mapper';
import type { ShopItemDto } from './dto/response/ShopItemDto';
import type { TrainerSaveDto } from '../trainers/dto/response/TrainerSaveDto';
import type { BuyItemDto } from './dto/request/BuyItemDto';
import type { BuyBulkItemDto } from './dto/request/BuyBulkItemDto';
import type { BuyMoveDto } from './dto/request/BuyMoveDto';
import { prisma } from '../../core/db/prisma';



@injectable()
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

  async getMoves() {
    return prisma.astralMoveShop.findMany({
      include: {
        move: {
          include: { type: true }
        }
      },
      orderBy: { price: 'asc' }
    });
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

    const isInfinity = item.category === 'infinity-only';

    if (isInfinity && trainer.infinityCoins < totalCost) {
      throw new AppError('Not enough Infinity Coins.', 400);
    } else if (!isInfinity && trainer.astralCoins < totalCost) {
      throw new AppError('Not enough Astral Coins.', 400);
    }

    const decrementData: any = {};
    if (isInfinity) decrementData.infinityCoins = { decrement: totalCost };
    else decrementData.astralCoins = { decrement: totalCost };

    // Execute in transaction
    await prisma.$transaction([
      prisma.trainerSave.update({
        where: { id: trainer.id },
        data: decrementData,
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
            equippedMoves: { include: { move: { include: { type: true } } } }
          }
        },
        unlockedMoves: true
      },
    });

    return TrainerMapper.toTrainerSaveDto(updatedTrainer!);
  }

  async buyBulkItems(userId: string, dto: BuyBulkItemDto): Promise<TrainerSaveDto> {
    const { items } = dto;
    if (!items || items.length === 0) {
      throw new AppError('No items provided.', 400);
    }

    const itemIds = items.map(i => i.itemId);
    const dbItems = await prisma.item.findMany({ where: { id: { in: itemIds } } });
    
    if (dbItems.length !== itemIds.length) {
      throw new AppError('One or more items not found.', 404);
    }

    const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!trainer) throw new AppError('Trainer profile not found.', 404);

    let totalAstralCost = 0;
    let totalInfinityCost = 0;

    const itemMap = new Map(dbItems.map(i => [i.id, i]));
    
    for (const requestedItem of items) {
      if (requestedItem.quantity <= 0) {
        throw new AppError('Quantity must be greater than zero.', 400);
      }
      const item = itemMap.get(requestedItem.itemId)!;
      const cost = item.cost * requestedItem.quantity;
      if (item.category === 'infinity-only') {
        totalInfinityCost += cost;
      } else {
        totalAstralCost += cost;
      }
    }

    if (trainer.astralCoins < totalAstralCost) {
      throw new AppError('Not enough Astral Coins.', 400);
    }
    if (trainer.infinityCoins < totalInfinityCost) {
      throw new AppError('Not enough Infinity Coins.', 400);
    }

    await prisma.$transaction(async (tx) => {
      const decrementData: any = {};
      if (totalAstralCost > 0) decrementData.astralCoins = { decrement: totalAstralCost };
      if (totalInfinityCost > 0) decrementData.infinityCoins = { decrement: totalInfinityCost };
      
      if (Object.keys(decrementData).length > 0) {
        await tx.trainerSave.update({
          where: { id: trainer.id },
          data: decrementData,
        });
      }

      for (const requestedItem of items) {
        await tx.inventoryItem.upsert({
          where: {
            trainerId_itemId: {
              trainerId: trainer.id,
              itemId: requestedItem.itemId,
            },
          },
          update: {
            quantity: { increment: requestedItem.quantity },
          },
          create: {
            trainerId: trainer.id,
            itemId: requestedItem.itemId,
            quantity: requestedItem.quantity,
          },
        });
      }
    });

    const updatedTrainer = await prisma.trainerSave.findUnique({
      where: { id: trainer.id },
      include: {
        inventory: { include: { item: true } },
        party: { include: { species: { include: { type1: true, type2: true } }, equippedMoves: { include: { move: { include: { type: true } } } } } },
        unlockedMoves: true
      },
    });

    return TrainerMapper.toTrainerSaveDto(updatedTrainer!);
  }

  async sellItem(userId: string, dto: BuyItemDto): Promise<TrainerSaveDto> {
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

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        trainerId_itemId: {
          trainerId: trainer.id,
          itemId: item.id,
        },
      },
    });

    if (!inventoryItem || inventoryItem.quantity < quantity) {
      throw new AppError(`You do not own enough ${item.name} to sell.`, 400);
    }

    const sellValue = Math.floor(item.cost * 0.75);
    const totalRefund = sellValue * quantity;
    const isInfinity = item.category === 'infinity-only';

    await prisma.$transaction(async (tx) => {
      const incrementData: any = isInfinity
        ? { infinityCoins: { increment: totalRefund } }
        : { astralCoins: { increment: totalRefund } };

      await tx.trainerSave.update({
        where: { id: trainer.id },
        data: incrementData,
      });

      if (inventoryItem.quantity === quantity) {
        await tx.inventoryItem.delete({
          where: { id: inventoryItem.id },
        });
      } else {
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: quantity } },
        });
      }
    });

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
            equippedMoves: { include: { move: { include: { type: true } } } }
          }
        },
        unlockedMoves: true
      },
    });

    return TrainerMapper.toTrainerSaveDto(updatedTrainer!);
  }

  async sellBulkItems(userId: string, dto: BuyBulkItemDto): Promise<TrainerSaveDto> {
    const { items } = dto;
    if (!items || items.length === 0) {
      throw new AppError('No items provided.', 400);
    }

    const itemIds = items.map(i => i.itemId);
    const dbItems = await prisma.item.findMany({ where: { id: { in: itemIds } } });
    
    if (dbItems.length !== itemIds.length) {
      throw new AppError('One or more items not found.', 404);
    }

    const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!trainer) throw new AppError('Trainer profile not found.', 404);

    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        trainerId: trainer.id,
        itemId: { in: itemIds }
      }
    });

    const inventoryMap = new Map(inventoryItems.map(i => [i.itemId, i]));
    const itemMap = new Map(dbItems.map(i => [i.id, i]));

    let totalAstralRefund = 0;
    let totalInfinityRefund = 0;

    for (const requestedItem of items) {
      if (requestedItem.quantity <= 0) {
        throw new AppError('Quantity must be greater than zero.', 400);
      }
      const item = itemMap.get(requestedItem.itemId)!;
      const invItem = inventoryMap.get(requestedItem.itemId);

      if (!invItem || invItem.quantity < requestedItem.quantity) {
        throw new AppError(`You do not own enough ${item.name} to sell.`, 400);
      }

      const sellValue = Math.floor(item.cost * 0.75);
      const refund = sellValue * requestedItem.quantity;

      if (item.category === 'infinity-only') {
        totalInfinityRefund += refund;
      } else {
        totalAstralRefund += refund;
      }
    }

    await prisma.$transaction(async (tx) => {
      const incrementData: any = {};
      if (totalAstralRefund > 0) incrementData.astralCoins = { increment: totalAstralRefund };
      if (totalInfinityRefund > 0) incrementData.infinityCoins = { increment: totalInfinityRefund };

      if (Object.keys(incrementData).length > 0) {
        await tx.trainerSave.update({
          where: { id: trainer.id },
          data: incrementData,
        });
      }

      for (const requestedItem of items) {
        const invItem = inventoryMap.get(requestedItem.itemId)!;
        if (invItem.quantity === requestedItem.quantity) {
          await tx.inventoryItem.delete({
            where: { id: invItem.id },
          });
        } else {
          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: { quantity: { decrement: requestedItem.quantity } },
          });
        }
      }
    });

    const updatedTrainer = await prisma.trainerSave.findUnique({
      where: { id: trainer.id },
      include: {
        inventory: { include: { item: true } },
        party: { include: { species: { include: { type1: true, type2: true } }, equippedMoves: { include: { move: { include: { type: true } } } } } },
        unlockedMoves: true
      },
    });

    return TrainerMapper.toTrainerSaveDto(updatedTrainer!);
  }

  async buyMove(userId: string, dto: BuyMoveDto): Promise<TrainerSaveDto> {
    const { moveId } = dto;

    const shopEntry = await prisma.astralMoveShop.findUnique({
      where: { moveId },
      include: { move: true }
    });

    if (!shopEntry) {
      throw new AppError('Move not available in shop.', 404);
    }

    const trainer = await prisma.trainerSave.findUnique({
      where: { userId },
      include: { unlockedMoves: true }
    });

    if (!trainer) {
      throw new AppError('Trainer profile not found.', 404);
    }

    const alreadyOwned = trainer.unlockedMoves.some(m => m.moveId === moveId);
    if (alreadyOwned) {
      throw new AppError('You already unlocked this move.', 400);
    }

    if (trainer.astralCoins < shopEntry.price) {
      throw new AppError('Not enough Astral Coins.', 400);
    }

    await prisma.$transaction([
      prisma.trainerSave.update({
        where: { id: trainer.id },
        data: { astralCoins: { decrement: shopEntry.price } }
      }),
      prisma.playerUnlockedMoves.create({
        data: {
          trainerId: trainer.id,
          moveId: moveId
        }
      })
    ]);

    const updatedTrainer = await prisma.trainerSave.findUnique({
      where: { id: trainer.id },
      include: {
        inventory: {
          include: { item: true }
        },
        party: {
          include: {
            species: { include: { type1: true, type2: true } },
            equippedMoves: { include: { move: { include: { type: true } } } }
          }
        },
        unlockedMoves: true
      }
    });

    return TrainerMapper.toTrainerSaveDto(updatedTrainer!);
  }
}
