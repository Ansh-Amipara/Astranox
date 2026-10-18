import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { AdminShopService } from '../admin-shop.service';
import { CacheService } from '../../../core/services/cache.service';
import { prisma } from '../../../core/db/prisma';
import { BadRequestError, NotFoundError } from '../../../core/errors/AppError';

describe('AdminShopService', () => {
  let adminShopService: AdminShopService;
  let mockCache: Record<string, any>;
  const adminId = '664b1f417e2941001a111111';

  beforeEach(() => {
    container.clearInstances();
    mockCache = {};

    const cacheServiceMock = {
      get: vi.fn(async (key: string) => mockCache[key] ?? null),
      set: vi.fn(async (key: string, val: any) => {
        mockCache[key] = val;
      }),
      del: vi.fn(async (key: string) => {
        delete mockCache[key];
      }),
      getClient: () => null,
      isRedisConnected: () => false,
    };

    container.registerInstance(CacheService, cacheServiceMock as any);
    adminShopService = container.resolve(AdminShopService);
  });

  describe('createShopItem', () => {
    it('creates a new shop item, upserts linked Item catalog record, and writes AuditLog', async () => {
      vi.spyOn(prisma.shopItem, 'findUnique').mockResolvedValue(null);

      const createdShopItem = {
        id: '664b1f417e2941001a111112',
        key: 'heavy-ball',
        name: 'Heavy Ball',
        category: 'balls',
        description: 'Effective for catching heavier Pokémon',
        currency: 'astralCoins',
        price: 3000,
        salePrice: null,
        saleStartsAt: null,
        saleEndsAt: null,
        enabled: true,
        isArchived: false,
        minLevel: 5,
        dailyLimitPerUser: 10,
        totalStock: 500,
        stockRemaining: 500,
        sortOrder: 2,
        spriteUrl: 'https://example.com/heavy-ball.png',
        effectType: 'POKEBALL',
        effectConfig: { catchMultiplier: 2.5 },
        updatedBy: adminId,
        dataVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const txSpy = vi.spyOn(prisma, '$transaction').mockResolvedValue([createdShopItem, {}, {}] as any);

      const result = await adminShopService.createShopItem(adminId, {
        key: 'heavy-ball',
        name: 'Heavy Ball',
        category: 'balls',
        description: 'Effective for catching heavier Pokémon',
        currency: 'astralCoins',
        price: 3000,
        enabled: true,
        minLevel: 5,
        dailyLimitPerUser: 10,
        totalStock: 500,
        sortOrder: 2,
        spriteUrl: 'https://example.com/heavy-ball.png',
        effectType: 'POKEBALL',
        effectConfig: { catchMultiplier: 2.5 },
        reason: 'Adding Heavy Ball to Pokémart catalog',
      });

      expect(txSpy).toHaveBeenCalled();
      expect(result.key).toBe('heavy-ball');
      expect(result.effectType).toBe('POKEBALL');
      expect(result.effectConfig).toEqual({ catchMultiplier: 2.5 });
      expect(result.isArchived).toBe(false);
    });

    it('rejects creation if key already exists', async () => {
      vi.spyOn(prisma.shopItem, 'findUnique').mockResolvedValue({
        id: '664b1f417e2941001a111113',
        key: 'poke-ball',
      } as any);

      await expect(
        adminShopService.createShopItem(adminId, {
          key: 'poke-ball',
          name: 'Poké Ball',
          category: 'balls',
          description: 'A standard ball',
          currency: 'astralCoins',
          price: 200,
          reason: 'Duplicate creation attempt',
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('archiveShopItem and unarchiveShopItem', () => {
    it('archives an item by setting isArchived: true, enabled: false and logging audit entry', async () => {
      const existingItem = {
        id: '664b1f417e2941001a111114',
        key: 'potion',
        name: 'Potion',
        category: 'healing',
        description: 'Restores 20 HP',
        currency: 'astralCoins',
        price: 300,
        salePrice: null,
        saleStartsAt: null,
        saleEndsAt: null,
        enabled: true,
        isArchived: false,
        minLevel: null,
        dailyLimitPerUser: null,
        totalStock: null,
        stockRemaining: null,
        sortOrder: 1,
        spriteUrl: null,
        effectType: 'HEAL_HP',
        effectConfig: { healAmount: 20 },
        updatedBy: adminId,
        dataVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.shopItem, 'findUnique').mockResolvedValue(existingItem as any);

      const archivedItem = { ...existingItem, isArchived: true, enabled: false };
      vi.spyOn(prisma, '$transaction').mockResolvedValue([archivedItem, {}] as any);

      const result = await adminShopService.archiveShopItem(
        adminId,
        'potion',
        'Archiving old potion variant'
      );

      expect(result.isArchived).toBe(true);
      expect(result.enabled).toBe(false);
    });

    it('fails to archive if reason is shorter than 5 characters', async () => {
      await expect(
        adminShopService.archiveShopItem(adminId, 'potion', 'bad')
      ).rejects.toThrow(BadRequestError);
    });

    it('unarchives an item restoring isArchived: false and enabled: true', async () => {
      const archivedItem = {
        id: '664b1f417e2941001a111114',
        key: 'potion',
        name: 'Potion',
        category: 'healing',
        description: 'Restores 20 HP',
        currency: 'astralCoins',
        price: 300,
        salePrice: null,
        saleStartsAt: null,
        saleEndsAt: null,
        enabled: false,
        isArchived: true,
        minLevel: null,
        dailyLimitPerUser: null,
        totalStock: null,
        stockRemaining: null,
        sortOrder: 1,
        spriteUrl: null,
        effectType: 'HEAL_HP',
        effectConfig: { healAmount: 20 },
        updatedBy: adminId,
        dataVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.shopItem, 'findUnique').mockResolvedValue(archivedItem as any);

      const restoredItem = { ...archivedItem, isArchived: false, enabled: true };
      vi.spyOn(prisma, '$transaction').mockResolvedValue([restoredItem, {}] as any);

      const result = await adminShopService.unarchiveShopItem(
        adminId,
        'potion',
        'Restoring potion to catalog'
      );

      expect(result.isArchived).toBe(false);
      expect(result.enabled).toBe(true);
    });
  });

  describe('updateShopItem', () => {
    it('updates item properties, functional effect configs, and handles price updates', async () => {
      const existing = {
        id: '664b1f417e2941001a111115',
        key: 'super-potion',
        name: 'Super Potion',
        category: 'healing',
        description: 'Restores 50 HP',
        currency: 'astralCoins',
        price: 700,
        salePrice: null,
        saleStartsAt: null,
        saleEndsAt: null,
        enabled: true,
        isArchived: false,
        minLevel: null,
        dailyLimitPerUser: null,
        totalStock: null,
        stockRemaining: null,
        sortOrder: 2,
        spriteUrl: null,
        effectType: 'HEAL_HP',
        effectConfig: { healAmount: 50 },
        updatedBy: adminId,
        dataVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.shopItem, 'findUnique').mockResolvedValue(existing as any);

      const updated = {
        ...existing,
        name: 'Super Potion XL',
        price: 800,
        effectConfig: { healAmount: 60 },
      };

      vi.spyOn(prisma, '$transaction').mockResolvedValue([updated, {}, {}, {}] as any);

      const result = await adminShopService.updateShopItem(adminId, 'super-potion', {
        name: 'Super Potion XL',
        price: 800,
        effectConfig: { healAmount: 60 },
        reason: 'Upgrading potion effect to 60 HP',
      });

      expect(result.name).toBe('Super Potion XL');
      expect(result.price).toBe(800);
      expect(result.effectConfig).toEqual({ healAmount: 60 });
    });

    it('requires confirmation on extreme (>50%) price adjustment', async () => {
      const existing = {
        id: '664b1f417e2941001a111116',
        key: 'hyper-potion',
        price: 1000,
        category: 'healing',
        name: 'Hyper Potion',
        enabled: true,
        isArchived: false,
      };

      vi.spyOn(prisma.shopItem, 'findUnique').mockResolvedValue(existing as any);

      // 1000 -> 2000 is 100% change (> 50%)
      await expect(
        adminShopService.updateShopItem(adminId, 'hyper-potion', {
          price: 2000,
          reason: 'Massive price hike without confirmation',
          confirmExtreme: false,
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('getAdminShopItems', () => {
    it('filters by archived status properly', async () => {
      const findManySpy = vi.spyOn(prisma.shopItem, 'findMany').mockResolvedValue([]);

      await adminShopService.getAdminShopItems({ isArchived: 'true' });
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isArchived: true }),
        })
      );

      await adminShopService.getAdminShopItems({ isArchived: 'all' });
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ isArchived: expect.anything() }),
        })
      );
    });
  });
});
