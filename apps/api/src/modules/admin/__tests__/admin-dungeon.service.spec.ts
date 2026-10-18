import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { AdminDungeonService } from '../admin-dungeon.service';
import { CacheService } from '../../../core/services/cache.service';
import { prisma } from '../../../core/db/prisma';
import { BadRequestError } from '../../../core/errors/AppError';

describe('AdminDungeonService', () => {
  let dungeonService: AdminDungeonService;
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
    dungeonService = container.resolve(AdminDungeonService);
  });

  describe('createFloorRule', () => {
    it('creates an Infinity Tower floor rule and logs audit entry', async () => {
      vi.spyOn(prisma.dungeonFloorRule, 'findFirst').mockResolvedValue(null);

      const created = {
        id: '664b1f417e2941001a333333',
        dungeonType: 'INFINITY_TOWER',
        floorNumber: 50,
        difficulty: null,
        title: 'Mid-Climb Apex',
        enemyPool: [{ speciesId: 150, name: 'mewtwo', level: 100 }],
        scalingFactor: 2.5,
        rewardCoins: 50000,
        rewardInfinityCoins: 250,
        rewardItems: [{ itemKey: 'master-ball', quantity: 1 }],
        ruleModifiers: { weather: 'RAIN' },
        isBossFloor: true,
        enabled: true,
        isArchived: false,
        sortOrder: 50,
        dataVersion: 1,
        updatedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const txSpy = vi.spyOn(prisma, '$transaction').mockResolvedValue([created, {}] as any);

      const result = await dungeonService.createFloorRule(adminId, {
        dungeonType: 'INFINITY_TOWER',
        floorNumber: 50,
        title: 'Mid-Climb Apex',
        enemyPool: [{ speciesId: 150, name: 'mewtwo', level: 100 }],
        scalingFactor: 2.5,
        rewardCoins: 50000,
        rewardInfinityCoins: 250,
        rewardItems: [{ itemKey: 'master-ball', quantity: 1 }],
        ruleModifiers: { weather: 'RAIN' },
        isBossFloor: true,
        reason: 'Adding floor 50 boss battle',
      });

      expect(txSpy).toHaveBeenCalled();
      expect(result.dungeonType).toBe('INFINITY_TOWER');
      expect(result.floorNumber).toBe(50);
      expect(result.isBossFloor).toBe(true);
      expect(result.rewardInfinityCoins).toBe(250);
    });

    it('rejects duplicate floor rule creation for same dungeon and floor', async () => {
      vi.spyOn(prisma.dungeonFloorRule, 'findFirst').mockResolvedValue({
        id: '664b1f417e2941001a333334',
        dungeonType: 'INFINITY_TOWER',
        floorNumber: 50,
      } as any);

      await expect(
        dungeonService.createFloorRule(adminId, {
          dungeonType: 'INFINITY_TOWER',
          floorNumber: 50,
          enemyPool: [],
          reason: 'Duplicate check',
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('archiveFloorRule and unarchiveFloorRule', () => {
    it('archives floor rule by setting isArchived: true, enabled: false', async () => {
      const existing = {
        id: '664b1f417e2941001a333335',
        dungeonType: 'VOID_RIFT',
        floorNumber: 10,
        difficulty: 'NIGHTMARE',
        enemyPool: [],
        enabled: true,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.dungeonFloorRule, 'findUnique').mockResolvedValue(existing as any);
      const archived = { ...existing, isArchived: true, enabled: false };
      vi.spyOn(prisma, '$transaction').mockResolvedValue([archived, {}] as any);

      const result = await dungeonService.archiveFloorRule(
        adminId,
        '664b1f417e2941001a333335',
        'Archiving nightmare floor 10 rule'
      );

      expect(result.isArchived).toBe(true);
      expect(result.enabled).toBe(false);
    });
  });
});
