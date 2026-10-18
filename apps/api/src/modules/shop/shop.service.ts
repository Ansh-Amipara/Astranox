import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { NotFoundError, BadRequestError, PriceChangedError, ForbiddenError } from '../../core/errors/AppError';
import { RedisLockService } from '../../core/services/redis-lock.service';
import { FeatureFlagService } from '../../core/services/feature-flag.service';
import { DEFAULT_SHOP_CATALOG, ECONOMY_CONSTANTS } from '@astranox/constants';
import type { ShopItemDto, PurchaseShopItemInput, BuyItemInput, BuyBulkInput, BuyMoveInput } from '@astranox/types';
import { TrainerMapper } from '../trainers/dto/mapper';

@injectable()
export class ShopService {
  constructor(
    private lockService: RedisLockService,
    private featureFlagService: FeatureFlagService
  ) {}

  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  public isSaleActive(item: { salePrice: number | null; saleStartsAt: Date | null; saleEndsAt: Date | null }): boolean {
    if (item.salePrice == null) return false;
    const now = Date.now();
    if (item.saleStartsAt && new Date(item.saleStartsAt).getTime() > now) return false;
    if (item.saleEndsAt && new Date(item.saleEndsAt).getTime() < now) return false;
    return true;
  }

  public calculateEffectivePrice(item: { price: number; salePrice: number | null; saleStartsAt: Date | null; saleEndsAt: Date | null }): {
    effectivePrice: number;
    isOnSale: boolean;
  } {
    const onSale = this.isSaleActive(item);
    return {
      effectivePrice: onSale && item.salePrice != null ? item.salePrice : item.price,
      isOnSale: onSale,
    };
  }

  async getItems(userId?: string): Promise<ShopItemDto[]> {
    const isShopEnabled = await this.featureFlagService.isEnabled('shop');
    if (!isShopEnabled) {
      throw new ForbiddenError('Pokémart is currently closed for maintenance.');
    }

    const items = await prisma.shopItem.findMany({
      where: { enabled: true },
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
    });

    const catalogMap = new Map(DEFAULT_SHOP_CATALOG.map((c) => [c.key, c]));
    const today = this.getTodayDateString();

    let userDailyMap = new Map<string, number>();
    if (userId) {
      const dailyPurchases = await prisma.userDailyPurchase.findMany({
        where: { userId, date: today },
      });
      userDailyMap = new Map(dailyPurchases.map((d) => [d.itemKey, d.count]));
    }

    return items.map((item) => {
      const { effectivePrice, isOnSale } = this.calculateEffectivePrice(item);
      const defaultMeta = catalogMap.get(item.key);
      const userPurchased = userDailyMap.get(item.key) || 0;
      const remainingDaily = item.dailyLimitPerUser != null ? Math.max(0, item.dailyLimitPerUser - userPurchased) : null;

      return {
        id: item.id,
        key: item.key,
        name: item.name,
        category: item.category,
        description: item.description,
        currency: item.currency as 'astralCoins' | 'infinityCoins',
        price: item.price,
        salePrice: item.salePrice,
        saleStartsAt: item.saleStartsAt ? item.saleStartsAt.toISOString() : null,
        saleEndsAt: item.saleEndsAt ? item.saleEndsAt.toISOString() : null,
        effectivePrice,
        isOnSale,
        enabled: item.enabled,
        minLevel: item.minLevel,
        dailyLimitPerUser: item.dailyLimitPerUser,
        userDailyPurchased: userPurchased,
        remainingDailyLimit: remainingDaily,
        totalStock: item.totalStock,
        stockRemaining: item.stockRemaining,
        sortOrder: item.sortOrder,
        spriteUrl: defaultMeta?.spriteUrl || null,
        dataVersion: item.dataVersion,
        updatedBy: item.updatedBy,
        updatedAt: item.updatedAt.toISOString(),
      };
    });
  }

  async purchaseItem(userId: string, input: PurchaseShopItemInput, requestId?: string) {
    const isShopEnabled = await this.featureFlagService.isEnabled('shop');
    if (!isShopEnabled) {
      throw new ForbiddenError('Pokémart is currently closed for maintenance.');
    }

    const { itemKey, quantity, expectedPrice } = input;
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be greater than zero.');
    }

    const lock = await this.lockService.acquireLock(`lock:user:${userId}`, 6000);

    try {
      // 1. Fetch item definition
      const shopItem = await prisma.shopItem.findUnique({
        where: { key: itemKey },
      });

      if (!shopItem || !shopItem.enabled) {
        throw new NotFoundError(`Item '${itemKey}' is not available in the shop.`);
      }

      // 2. Compute server-side effective price
      const { effectivePrice } = this.calculateEffectivePrice(shopItem);

      if (expectedPrice !== undefined && expectedPrice !== effectivePrice) {
        throw new PriceChangedError(
          `The price of ${shopItem.name} has changed from ${expectedPrice} to ${effectivePrice}.`,
          effectivePrice,
          itemKey
        );
      }

      // 3. Check stock limits
      if (shopItem.totalStock != null) {
        const remaining = shopItem.stockRemaining ?? shopItem.totalStock;
        if (remaining < quantity) {
          throw new BadRequestError(`Insufficient stock remaining for ${shopItem.name} (available: ${remaining}).`);
        }
      }

      // 4. Check user daily limits
      const today = this.getTodayDateString();
      if (shopItem.dailyLimitPerUser != null) {
        const dailyRecord = await prisma.userDailyPurchase.findUnique({
          where: {
            userId_itemKey_date: {
              userId,
              itemKey,
              date: today,
            },
          },
        });
        const currentCount = dailyRecord?.count || 0;
        if (currentCount + quantity > shopItem.dailyLimitPerUser) {
          const remaining = Math.max(0, shopItem.dailyLimitPerUser - currentCount);
          throw new BadRequestError(
            `Daily purchase limit reached for ${shopItem.name}. You can only buy ${remaining} more today.`
          );
        }
      }

      // 5. Check user funds
      const trainer = await prisma.trainerSave.findUnique({
        where: { userId },
        include: { inventory: { include: { item: true } } },
      });

      if (!trainer) {
        throw new NotFoundError('Trainer save profile not found.');
      }

      const totalCost = effectivePrice * quantity;
      const isInfinity = shopItem.currency === 'infinityCoins';

      if (isInfinity) {
        if (trainer.infinityCoins < totalCost) {
          throw new BadRequestError(`Not enough Infinity Coins. Required: ${totalCost}, available: ${trainer.infinityCoins}.`);
        }
      } else {
        if (trainer.astralCoins < totalCost) {
          throw new BadRequestError(`Not enough Astral Coins. Required: ${totalCost}, available: ${trainer.astralCoins}.`);
        }
      }

      // Find or create matching Item in Prisma Item model to link inventory
      let inventoryTargetItem = await prisma.item.findUnique({
        where: { id: itemKey },
      });
      if (!inventoryTargetItem) {
        inventoryTargetItem = await prisma.item.create({
          data: {
            id: itemKey,
            name: shopItem.name,
            cost: shopItem.price,
            description: shopItem.description,
            category: shopItem.category,
          },
        });
      }

      // 6. Execute atomic transaction
      const currencyDecrement = isInfinity
        ? { infinityCoins: { decrement: totalCost } }
        : { astralCoins: { decrement: totalCost } };

      const [updatedTrainer] = await prisma.$transaction([
        // Deduct currency
        prisma.trainerSave.update({
          where: { id: trainer.id },
          data: currencyDecrement,
          include: { inventory: { include: { item: true } } },
        }),
        // Decrement stock if item has stock limit
        ...(shopItem.totalStock != null
          ? [
              prisma.shopItem.update({
                where: { key: itemKey },
                data: {
                  stockRemaining: { decrement: quantity },
                },
              }),
            ]
          : []),
        // Grant item to inventory
        prisma.inventoryItem.upsert({
          where: {
            trainerId_itemId: {
              trainerId: trainer.id,
              itemId: inventoryTargetItem.id,
            },
          },
          update: {
            quantity: { increment: quantity },
          },
          create: {
            trainerId: trainer.id,
            itemId: inventoryTargetItem.id,
            quantity: quantity,
          },
        }),
        // Track daily purchases
        prisma.userDailyPurchase.upsert({
          where: {
            userId_itemKey_date: {
              userId,
              itemKey,
              date: today,
            },
          },
          update: {
            count: { increment: quantity },
          },
          create: {
            userId,
            itemKey,
            date: today,
            count: quantity,
          },
        }),
        // Record AuditLog
        prisma.auditLog.create({
          data: {
            adminId: userId,
            action: 'SHOP_PURCHASE',
            entityType: 'SHOP_ITEM',
            entityId: itemKey,
            reason: `Purchased ${quantity}x ${shopItem.name}`,
            requestId: requestId || null,
            afterValues: {
              itemKey,
              quantity,
              unitPrice: effectivePrice,
              totalCost,
              currency: shopItem.currency,
            },
          },
        }),
      ]);

      return {
        trainer: TrainerMapper.toTrainerSaveDto(updatedTrainer),
        purchased: {
          itemKey: shopItem.key,
          name: shopItem.name,
          quantity,
          unitPrice: effectivePrice,
          totalCost,
          currency: shopItem.currency,
        },
      };
    } finally {
      await this.lockService.releaseLock(lock);
    }
  }

  // --- Backwards Compatibility Methods ---

  async buyItem(userId: string, dto: BuyItemInput) {
    const res = await this.purchaseItem(userId, { itemKey: dto.itemId, quantity: dto.quantity });
    return res.trainer;
  }

  async buyBulkItems(userId: string, dto: BuyBulkInput) {
    let lastTrainerDto: any = null;
    for (const item of dto.items) {
      const res = await this.purchaseItem(userId, { itemKey: item.itemId, quantity: item.quantity });
      lastTrainerDto = res.trainer;
    }
    return lastTrainerDto;
  }

  async getMoves() {
    return prisma.astralMoveShop.findMany({
      include: {
        move: {
          include: { type: true },
        },
      },
      orderBy: { price: 'asc' },
    });
  }

  async buyMove(userId: string, dto: BuyMoveInput) {
    const { moveId } = dto;
    const moveShopItem = await prisma.astralMoveShop.findUnique({
      where: { moveId },
      include: { move: true },
    });

    if (!moveShopItem) {
      throw new NotFoundError('Move not found in Astral Move Shop.');
    }

    const trainer = await prisma.trainerSave.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundError('Trainer profile not found.');
    }

    if (trainer.astralCoins < moveShopItem.price) {
      throw new BadRequestError('Not enough Astral Coins.');
    }

    const existingUnlocked = await prisma.playerUnlockedMoves.findUnique({
      where: {
        trainerId_moveId: {
          trainerId: trainer.id,
          moveId,
        },
      },
    });

    if (existingUnlocked) {
      throw new BadRequestError('You already purchased this move.');
    }

    const [updatedTrainer] = await prisma.$transaction([
      prisma.trainerSave.update({
        where: { id: trainer.id },
        data: { astralCoins: { decrement: moveShopItem.price } },
      }),
      prisma.playerUnlockedMoves.create({
        data: {
          trainerId: trainer.id,
          moveId,
        },
      }),
    ]);

    return TrainerMapper.toTrainerSaveDto(updatedTrainer);
  }

  async sellItem(userId: string, dto: BuyItemInput) {
    const { itemId, quantity } = dto;
    const trainer = await prisma.trainerSave.findUnique({
      where: { userId },
      include: { inventory: true },
    });
    if (!trainer) throw new NotFoundError('Trainer not found.');

    const invItem = trainer.inventory.find((i) => i.itemId === itemId);
    if (!invItem || invItem.quantity < quantity) {
      throw new BadRequestError('Not enough items in inventory to sell.');
    }

    const shopItem = await prisma.shopItem.findUnique({ where: { key: itemId } });
    const unitCost = shopItem ? shopItem.price : ECONOMY_CONSTANTS.DEFAULT_SHOP_ITEM_COST;
    const unitPayout = Math.floor(unitCost * ECONOMY_CONSTANTS.SHOP_SELL_PRICE_RATIO);
    const totalPayout = unitPayout * quantity;

    const [updatedTrainer] = await prisma.$transaction([
      prisma.trainerSave.update({
        where: { id: trainer.id },
        data: { astralCoins: { increment: totalPayout } },
      }),
      invItem.quantity === quantity
        ? prisma.inventoryItem.delete({ where: { id: invItem.id } })
        : prisma.inventoryItem.update({
            where: { id: invItem.id },
            data: { quantity: { decrement: quantity } },
          }),
    ]);

    return TrainerMapper.toTrainerSaveDto(updatedTrainer);
  }

  async sellBulkItems(userId: string, dto: BuyBulkInput) {
    let lastTrainerDto: any = null;
    for (const item of dto.items) {
      lastTrainerDto = await this.sellItem(userId, item);
    }
    return lastTrainerDto;
  }
}
