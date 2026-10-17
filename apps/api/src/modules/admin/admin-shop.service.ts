import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { CacheService } from '../../core/services/cache.service';
import { DEFAULT_SHOP_CATALOG, SHOP_LIMITS } from '@astranox/constants';
import type {
  ShopItemDto,
  UpdateShopItemInput,
  BulkPriceUpdateInput,
  BulkPriceResultDto,
  BulkPricePreviewItem,
  ShopPriceHistoryDto,
} from '@astranox/types';

@injectable()
export class AdminShopService {
  constructor(private cache: CacheService) {}

  private isSaleActive(item: { salePrice: number | null; saleStartsAt: Date | null; saleEndsAt: Date | null }): boolean {
    if (item.salePrice == null) return false;
    const now = Date.now();
    if (item.saleStartsAt && new Date(item.saleStartsAt).getTime() > now) return false;
    if (item.saleEndsAt && new Date(item.saleEndsAt).getTime() < now) return false;
    return true;
  }

  async getAdminShopItems(query: { category?: string; search?: string; enabled?: string }): Promise<ShopItemDto[]> {
    const where: any = {};

    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    if (query.search && query.search.trim().length > 0) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { key: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    if (query.enabled !== undefined) {
      where.enabled = query.enabled === 'true';
    }

    const items = await prisma.shopItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
    });

    const catalogMap = new Map(DEFAULT_SHOP_CATALOG.map((c) => [c.key, c]));

    return items.map((item) => {
      const onSale = this.isSaleActive(item);
      const effectivePrice = onSale && item.salePrice != null ? item.salePrice : item.price;
      const defaultMeta = catalogMap.get(item.key);

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
        isOnSale: onSale,
        enabled: item.enabled,
        minLevel: item.minLevel,
        dailyLimitPerUser: item.dailyLimitPerUser,
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

  async updateShopItem(
    adminId: string,
    key: string,
    input: UpdateShopItemInput,
    requestId?: string
  ): Promise<ShopItemDto> {
    const item = await prisma.shopItem.findUnique({
      where: { key },
    });

    if (!item) {
      throw new NotFoundError(`Shop item with key '${key}' not found.`);
    }

    const defaultDef = DEFAULT_SHOP_CATALOG.find((c) => c.key === key);
    const newPrice = input.price !== undefined ? input.price : item.price;
    const newSalePrice = input.salePrice !== undefined ? input.salePrice : item.salePrice;

    // Guardrail: Check for extreme price changes (>50% move or <50% of default catalog price)
    if (input.price !== undefined && input.price !== item.price) {
      const percentChange = Math.abs(((input.price - item.price) / item.price) * 100);
      const belowDefault50Percent = defaultDef ? input.price < defaultDef.price * 0.5 : false;

      if ((percentChange > SHOP_LIMITS.EXTREME_PRICE_CHANGE_PERCENT || belowDefault50Percent) && !input.confirmExtreme) {
        throw new BadRequestError(
          `Extreme price change detected (${percentChange.toFixed(1)}% shift). Please pass confirmExtreme: true to proceed.`
        );
      }
    }

    const beforeValues = {
      price: item.price,
      salePrice: item.salePrice,
      saleStartsAt: item.saleStartsAt,
      saleEndsAt: item.saleEndsAt,
      enabled: item.enabled,
      minLevel: item.minLevel,
      dailyLimitPerUser: item.dailyLimitPerUser,
      totalStock: item.totalStock,
      stockRemaining: item.stockRemaining,
    };

    const updateData: any = {
      dataVersion: { increment: 1 },
      updatedBy: adminId,
    };

    if (input.price !== undefined) updateData.price = input.price;
    if (input.salePrice !== undefined) updateData.salePrice = input.salePrice;
    if (input.saleStartsAt !== undefined) {
      updateData.saleStartsAt = input.saleStartsAt ? new Date(input.saleStartsAt) : null;
    }
    if (input.saleEndsAt !== undefined) {
      updateData.saleEndsAt = input.saleEndsAt ? new Date(input.saleEndsAt) : null;
    }
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.minLevel !== undefined) updateData.minLevel = input.minLevel;
    if (input.dailyLimitPerUser !== undefined) updateData.dailyLimitPerUser = input.dailyLimitPerUser;
    if (input.totalStock !== undefined) {
      updateData.totalStock = input.totalStock;
      if (input.stockRemaining === undefined) {
        updateData.stockRemaining = input.totalStock;
      }
    }
    if (input.stockRemaining !== undefined) updateData.stockRemaining = input.stockRemaining;

    // Atomic update + History + AuditLog
    const [updated] = await prisma.$transaction([
      prisma.shopItem.update({
        where: { key },
        data: updateData,
      }),
      // Write price history if price or sale price changed
      ...(input.price !== undefined || input.salePrice !== undefined
        ? [
            prisma.shopPriceHistory.create({
              data: {
                itemKey: key,
                oldPrice: item.price,
                newPrice,
                oldSalePrice: item.salePrice,
                newSalePrice,
                changedBy: adminId,
                reason: input.reason,
                requestId: requestId || null,
              },
            }),
          ]
        : []),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'SHOP_ITEM_UPDATE',
          entityType: 'SHOP_ITEM',
          entityId: key,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues,
          afterValues: updateData,
        },
      }),
    ]);

    await this.cache.del('shop:catalog:public');

    const onSale = this.isSaleActive(updated);
    return {
      id: updated.id,
      key: updated.key,
      name: updated.name,
      category: updated.category,
      description: updated.description,
      currency: updated.currency as 'astralCoins' | 'infinityCoins',
      price: updated.price,
      salePrice: updated.salePrice,
      saleStartsAt: updated.saleStartsAt ? updated.saleStartsAt.toISOString() : null,
      saleEndsAt: updated.saleEndsAt ? updated.saleEndsAt.toISOString() : null,
      effectivePrice: onSale && updated.salePrice != null ? updated.salePrice : updated.price,
      isOnSale: onSale,
      enabled: updated.enabled,
      minLevel: updated.minLevel,
      dailyLimitPerUser: updated.dailyLimitPerUser,
      totalStock: updated.totalStock,
      stockRemaining: updated.stockRemaining,
      sortOrder: updated.sortOrder,
      spriteUrl: defaultDef?.spriteUrl || null,
      dataVersion: updated.dataVersion,
      updatedBy: updated.updatedBy,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async applyBulkPriceUpdate(
    adminId: string,
    input: BulkPriceUpdateInput,
    requestId?: string
  ): Promise<BulkPriceResultDto> {
    const { itemKeys, mode, value, dryRun, reason, confirmExtreme } = input;

    const items = await prisma.shopItem.findMany({
      where: { key: { in: itemKeys } },
    });

    if (items.length === 0) {
      throw new NotFoundError('No matching shop items found.');
    }

    const previewList: BulkPricePreviewItem[] = [];
    let hasExtremeChange = false;

    for (const item of items) {
      let newPrice = item.price;
      if (mode === 'set') {
        newPrice = value;
      } else if (mode === 'percent_inc') {
        newPrice = Math.round(item.price * (1 + value / 100));
      } else if (mode === 'percent_dec') {
        newPrice = Math.max(0, Math.round(item.price * (1 - value / 100)));
      }

      // Bound price within limits
      newPrice = Math.max(SHOP_LIMITS.MIN_PRICE, Math.min(newPrice, SHOP_LIMITS.MAX_PRICE));

      const percentChange = item.price > 0 ? ((newPrice - item.price) / item.price) * 100 : 0;
      const isExtreme = Math.abs(percentChange) > SHOP_LIMITS.EXTREME_PRICE_CHANGE_PERCENT;
      if (isExtreme) {
        hasExtremeChange = true;
      }

      previewList.push({
        key: item.key,
        name: item.name,
        oldPrice: item.price,
        newPrice,
        percentChange: Number(percentChange.toFixed(1)),
        isExtremeChange: isExtreme,
      });
    }

    if (hasExtremeChange && !confirmExtreme && !dryRun) {
      throw new BadRequestError(
        'One or more items have extreme price shifts (>50%). Set confirmExtreme: true to proceed.'
      );
    }

    if (dryRun) {
      return {
        dryRun: true,
        items: previewList,
        updatedCount: 0,
      };
    }

    // Execute bulk updates in transaction
    const updateOps: any[] = [];
    for (const preview of previewList) {
      const item = items.find((i) => i.key === preview.key)!;
      updateOps.push(
        prisma.shopItem.update({
          where: { key: preview.key },
          data: {
            price: preview.newPrice,
            updatedBy: adminId,
            dataVersion: { increment: 1 },
          },
        }),
        prisma.shopPriceHistory.create({
          data: {
            itemKey: preview.key,
            oldPrice: item.price,
            newPrice: preview.newPrice,
            oldSalePrice: item.salePrice,
            newSalePrice: item.salePrice,
            changedBy: adminId,
            reason: `Bulk Update (${mode} ${value}): ${reason}`,
            requestId: requestId || null,
          },
        })
      );
    }

    updateOps.push(
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'SHOP_BULK_PRICE_UPDATE',
          entityType: 'SHOP_ITEM',
          reason,
          requestId: requestId || null,
          afterValues: {
            mode,
            value,
            affectedKeys: itemKeys,
          },
        },
      })
    );

    await prisma.$transaction(updateOps);
    await this.cache.del('shop:catalog:public');

    return {
      dryRun: false,
      items: previewList,
      updatedCount: previewList.length,
    };
  }

  async getShopPriceHistory(itemKey: string): Promise<ShopPriceHistoryDto[]> {
    const history = await prisma.shopPriceHistory.findMany({
      where: { itemKey },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const userIds = Array.from(new Set(history.map((h) => h.changedBy)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.username]));

    return history.map((h) => ({
      id: h.id,
      itemKey: h.itemKey,
      oldPrice: h.oldPrice,
      newPrice: h.newPrice,
      oldSalePrice: h.oldSalePrice,
      newSalePrice: h.newSalePrice,
      changedBy: h.changedBy,
      changerUsername: userMap.get(h.changedBy) || 'Staff',
      reason: h.reason,
      requestId: h.requestId,
      createdAt: h.createdAt.toISOString(),
    }));
  }

  async resetShopItem(adminId: string, key: string, reason: string, requestId?: string): Promise<ShopItemDto> {
    const defaultDef = DEFAULT_SHOP_CATALOG.find((c) => c.key === key);
    if (!defaultDef) {
      throw new NotFoundError(`Default catalog item not found for key '${key}'.`);
    }

    const currentItem = await prisma.shopItem.findUnique({
      where: { key },
    });

    if (!currentItem) {
      throw new NotFoundError(`Shop item with key '${key}' does not exist.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.shopItem.update({
        where: { key },
        data: {
          price: defaultDef.price,
          salePrice: null,
          saleStartsAt: null,
          saleEndsAt: null,
          enabled: true,
          dailyLimitPerUser: null,
          totalStock: null,
          stockRemaining: null,
          updatedBy: adminId,
          dataVersion: { increment: 1 },
        },
      }),
      prisma.shopPriceHistory.create({
        data: {
          itemKey: key,
          oldPrice: currentItem.price,
          newPrice: defaultDef.price,
          oldSalePrice: currentItem.salePrice,
          newSalePrice: null,
          changedBy: adminId,
          reason: `Reset to Default: ${reason}`,
          requestId: requestId || null,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'SHOP_ITEM_RESET',
          entityType: 'SHOP_ITEM',
          entityId: key,
          reason,
          requestId: requestId || null,
          beforeValues: JSON.parse(JSON.stringify(currentItem)),
          afterValues: JSON.parse(JSON.stringify(defaultDef)),
        },
      }),
    ]);

    await this.cache.del('shop:catalog:public');

    return {
      id: updated.id,
      key: updated.key,
      name: updated.name,
      category: updated.category,
      description: updated.description,
      currency: updated.currency as 'astralCoins' | 'infinityCoins',
      price: updated.price,
      salePrice: null,
      saleStartsAt: null,
      saleEndsAt: null,
      effectivePrice: updated.price,
      isOnSale: false,
      enabled: updated.enabled,
      minLevel: updated.minLevel,
      dailyLimitPerUser: updated.dailyLimitPerUser,
      totalStock: updated.totalStock,
      stockRemaining: updated.stockRemaining,
      sortOrder: updated.sortOrder,
      spriteUrl: defaultDef.spriteUrl,
      dataVersion: updated.dataVersion,
      updatedBy: updated.updatedBy,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
