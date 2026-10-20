import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { CacheService } from '../../core/services/cache.service';
import type { AdminStatsDto, EconomyReportDto } from '@astranox/types';

@injectable()
export class AdminDashboardService {
  private readonly CACHE_KEY = 'admin:dashboard:stats';
  private readonly TTL_SECONDS = 60;

  constructor(private cache: CacheService) {}

  async getStats(): Promise<AdminStatsDto> {
    const cached = await this.cache.get<AdminStatsDto>(this.CACHE_KEY);
    if (cached) return cached;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      activePlayers24h,
      newRegistrations24h,
      battles24h,
      coinAgg,
      recentActions,
    ] = await prisma.$transaction([
      prisma.user.count({ where: { updatedAt: { gte: oneDayAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.battleSession.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.trainerSave.aggregate({
        _sum: {
          astralCoins: true,
          infinityCoins: true,
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const adminIds = Array.from(
      new Set(
        recentActions
          .map((a) => (a as any).actorId || a.adminId)
          .filter((id): id is string => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id))
      )
    );
    const adminUsers = adminIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: adminIds } },
          select: { id: true, username: true },
        })
      : [];
    const adminMap = new Map(adminUsers.map((u) => [u.id, u.username]));

    const stats: AdminStatsDto = {
      activePlayers24h: Math.max(activePlayers24h, 1),
      newRegistrations24h,
      battles24h,
      currencyInCirculation: {
        astralCoins: coinAgg._sum.astralCoins || 0,
        infinityCoins: coinAgg._sum.infinityCoins || 0,
      },
      topPurchasedItems: await this.getTopPurchasedItems(),
      recentActions: recentActions.map((a) => {
        const actor = a.adminId || (a as any).actorId;
        return {
          id: a.id,
          adminId: actor || null,
          adminUsername: (actor ? adminMap.get(actor) : undefined) || 'Staff',
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          reason: a.reason,
          requestId: a.requestId,
          beforeValues: a.beforeValues,
          afterValues: a.afterValues,
          ipAddress: a.ipAddress,
          createdAt: a.createdAt.toISOString(),
        };
      }),
    };

    await this.cache.set(this.CACHE_KEY, stats, this.TTL_SECONDS);
    return stats;
  }

  private async getTopPurchasedItems(): Promise<AdminStatsDto['topPurchasedItems']> {
    try {
      const dailyPurchases = await prisma.userDailyPurchase.groupBy({
        by: ['itemKey'],
        _sum: { count: true },
        orderBy: { _sum: { count: 'desc' } },
        take: 5,
      });

      if (!dailyPurchases.length) {
        return [];
      }

      const itemKeys = dailyPurchases.map((dp) => dp.itemKey);
      const shopItems = await prisma.shopItem.findMany({
        where: { key: { in: itemKeys } },
        select: { key: true, name: true, price: true },
      });
      const itemMap = new Map(shopItems.map((si) => [si.key, si]));

      return dailyPurchases.map((dp) => {
        const item = itemMap.get(dp.itemKey);
        const totalPurchased = dp._sum.count || 0;
        const unitPrice = item?.price || 0;
        return {
          itemKey: dp.itemKey,
          name: item?.name || dp.itemKey,
          totalPurchased,
          totalVolume: totalPurchased * unitPrice,
        };
      });
    } catch {
      return [];
    }
  }

  async getEconomyReport(): Promise<EconomyReportDto> {
    const coinAgg = await prisma.trainerSave.aggregate({
      _sum: {
        astralCoins: true,
        infinityCoins: true,
      },
    });

    const totalAstral = coinAgg._sum.astralCoins || 0;
    const totalInfinity = coinAgg._sum.infinityCoins || 0;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPurchases = await prisma.auditLog.findMany({
      where: {
        action: 'SHOP_PURCHASE',
        createdAt: { gte: oneDayAgo },
      },
      select: { afterValues: true },
    });

    let astralSpent24h = 0;
    let infinitySpent24h = 0;

    for (const p of recentPurchases) {
      const vals = p.afterValues as any;
      if (vals?.currency === 'infinityCoins') {
        infinitySpent24h += Number(vals.totalCost || 0);
      } else {
        astralSpent24h += Number(vals.totalCost || 0);
      }
    }

    const recentGrants = await prisma.auditLog.findMany({
      where: {
        action: 'USER_GRANT_CURRENCY',
        createdAt: { gte: oneDayAgo },
      },
      select: { afterValues: true },
    });

    let astralGranted24h = 0;
    let infinityGranted24h = 0;

    for (const g of recentGrants) {
      const vals = g.afterValues as any;
      if (vals?.currencyType === 'infinityCoins') {
        infinityGranted24h += Number(vals.amount || 0);
      } else {
        astralGranted24h += Number(vals.amount || 0);
      }
    }

    const sources: EconomyReportDto['sources'] = [];
    if (astralGranted24h > 0) {
      sources.push({ source: 'Staff Currency Grants', amount: astralGranted24h, currency: 'astralCoins' });
    }
    if (infinityGranted24h > 0) {
      sources.push({ source: 'Staff Infinity Grants', amount: infinityGranted24h, currency: 'infinityCoins' });
    }

    const sinks: EconomyReportDto['sinks'] = [];
    if (astralSpent24h > 0) {
      sinks.push({ sink: 'Pokémart Astral Purchases', amount: astralSpent24h, currency: 'astralCoins' });
    }
    if (infinitySpent24h > 0) {
      sinks.push({ sink: 'Pokémart Infinity Purchases', amount: infinitySpent24h, currency: 'infinityCoins' });
    }

    return {
      summary: {
        totalAstralCoins: totalAstral,
        totalInfinityCoins: totalInfinity,
        netAstralChange24h: astralGranted24h - astralSpent24h,
        netInfinityChange24h: infinityGranted24h - infinitySpent24h,
      },
      sources,
      sinks,
    };
  }
}
