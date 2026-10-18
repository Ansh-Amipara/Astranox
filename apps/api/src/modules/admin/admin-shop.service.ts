import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { CacheService } from '../../core/services/cache.service';
import { DEFAULT_SHOP_CATALOG, SHOP_LIMITS } from '@astranox/constants';
import type {
  ShopItemDto,
  CreateShopItemInput,
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

  private mapToDto(item: any, catalogMap?: Map<string, any>): ShopItemDto {
    const onSale = this.isSaleActive(item);
    const effectivePrice = onSale && item.salePrice != null ? item.salePrice : item.price;
    const defaultMeta = catalogMap ? catalogMap.get(item.key) : DEFAULT_SHOP_CATALOG.find((c) => c.key === item.key);

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
      isArchived: item.isArchived ?? false,
      minLevel: item.minLevel,
      dailyLimitPerUser: item.dailyLimitPerUser,
      totalStock: item.totalStock,
      stockRemaining: item.stockRemaining,
      sortOrder: item.sortOrder,
      spriteUrl: item.spriteUrl || defaultMeta?.spriteUrl || null,
      effectType: item.effectType || null,
      effectConfig: item.effectConfig || null,
      dataVersion: item.dataVersion,
      updatedBy: item.updatedBy,
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async getAdminShopItems(query: { category?: string; search?: string; enabled?: string; isArchived?: string }): Promise<ShopItemDto[]> {
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

    if (query.isArchived === 'true') {
      where.isArchived = true;
    } else if (query.isArchived === 'all') {
      // Return both active and archived
    } else {
      where.isArchived = false;
    }

    const items = await prisma.shopItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
    });

    const catalogMap = new Map(DEFAULT_SHOP_CATALOG.map((c) => [c.key, c]));
    return items.map((item) => this.mapToDto(item, catalogMap));
  }

  async createShopItem(
    adminId: string,
    input: CreateShopItemInput,
    requestId?: string
  ): Promise<ShopItemDto> {
    const existing = await prisma.shopItem.findUnique({
      where: { key: input.key },
    });

    if (existing) {
      throw new BadRequestError(`Shop item with key '${input.key}' already exists.`);
    }

    const [created] = await prisma.$transaction([
      prisma.shopItem.create({
        data: {
          key: input.key,
          name: input.name,
          category: input.category,
          description: input.description,
          currency: input.currency,
          price: input.price,
          salePrice: input.salePrice,
          saleStartsAt: input.saleStartsAt ? new Date(input.saleStartsAt) : null,
          saleEndsAt: input.saleEndsAt ? new Date(input.saleEndsAt) : null,
          enabled: input.enabled ?? true,
          isArchived: false,
          minLevel: input.minLevel,
          dailyLimitPerUser: input.dailyLimitPerUser,
          totalStock: input.totalStock,
          stockRemaining: input.totalStock,
          sortOrder: input.sortOrder ?? 0,
          spriteUrl: input.spriteUrl || null,
          effectType: input.effectType || null,
          effectConfig: input.effectConfig || null,
          updatedBy: adminId,
          dataVersion: 1,
        },
      }),
      prisma.item.upsert({
        where: { id: input.key },
        create: {
          id: input.key,
          name: input.name,
          cost: input.price,
          description: input.description,
          category: input.category,
          spriteUrl: input.spriteUrl || null,
        },
        update: {
          name: input.name,
          cost: input.price,
          description: input.description,
          category: input.category,
          spriteUrl: input.spriteUrl || null,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'SHOP_ITEM_CREATE',
          entityType: 'SHOP_ITEM',
          entityId: input.key,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues: null,
          afterValues: input,
        },
      }),
    ]);

    await this.cache.del('shop:catalog:public');
    return this.mapToDto(created);
  }

  async archiveShopItem(
    adminId: string,
    key: string,
    reason: string,
    requestId?: string
  ): Promise<ShopItemDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to archive an item.');
    }

    const item = await prisma.shopItem.findUnique({
      where: { key },
    });

    if (!item) {
      throw new NotFoundError(`Shop item with key '${key}' not found.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.shopItem.update({
        where: { key },
        data: {
          isArchived: true,
          enabled: false,
          updatedBy: adminId,
          dataVersion: { increment: 1 },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'SHOP_ITEM_ARCHIVE',
          entityType: 'SHOP_ITEM',
          entityId: key,
          reason,
          requestId: requestId || null,
          beforeValues: { isArchived: item.isArchived, enabled: item.enabled },
          afterValues: { isArchived: true, enabled: false },
        },
      }),
    ]);

    await this.cache.del('shop:catalog:public');
    return this.mapToDto(updated);
  }

  async unarchiveShopItem(
    adminId: string,
    key: string,
    reason: string,
    requestId?: string
  ): Promise<ShopItemDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to restore an item.');
    }

    const item = await prisma.shopItem.findUnique({
      where: { key },
    });

    if (!item) {
      throw new NotFoundError(`Shop item with key '${key}' not found.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.shopItem.update({
        where: { key },
        data: {
          isArchived: false,
          enabled: true,
          updatedBy: adminId,
          dataVersion: { increment: 1 },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'SHOP_ITEM_UNARCHIVE',
          entityType: 'SHOP_ITEM',
          entityId: key,
          reason,
          requestId: requestId || null,
          beforeValues: { isArchived: item.isArchived, enabled: item.enabled },
          afterValues: { isArchived: false, enabled: true },
        },
      }),
    ]);

    await this.cache.del('shop:catalog:public');
    return this.mapToDto(updated);
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
    if (input.name !== undefined) updateData.name = input.name;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.spriteUrl !== undefined) updateData.spriteUrl = input.spriteUrl;
    if (input.effectType !== undefined) updateData.effectType = input.effectType;
    if (input.effectConfig !== undefined) updateData.effectConfig = input.effectConfig;
    if (input.isArchived !== undefined) updateData.isArchived = input.isArchived;

    const itemSyncData: any = {};
    if (input.name !== undefined) itemSyncData.name = input.name;
    if (input.category !== undefined) itemSyncData.category = input.category;
    if (input.description !== undefined) itemSyncData.description = input.description;
    if (input.price !== undefined) itemSyncData.cost = input.price;
    if (input.spriteUrl !== undefined) itemSyncData.spriteUrl = input.spriteUrl;

    // Atomic update + History + AuditLog
    const [updated] = await prisma.$transaction([
      prisma.shopItem.update({
        where: { key },
        data: updateData,
      }),
      ...(Object.keys(itemSyncData).length > 0
        ? [
            prisma.item.updateMany({
              where: { id: key },
              data: itemSyncData,
            }),
          ]
        : []),
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
    return this.mapToDto(updated);
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
    return this.mapToDto(updated);
  }
}
