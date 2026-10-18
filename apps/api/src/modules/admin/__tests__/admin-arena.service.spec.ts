import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { AdminArenaService } from '../admin-arena.service';
import { CacheService } from '../../../core/services/cache.service';
import { prisma } from '../../../core/db/prisma';
import { BadRequestError, NotFoundError } from '../../../core/errors/AppError';

describe('AdminArenaService', () => {
  let arenaService: AdminArenaService;
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
    arenaService = container.resolve(AdminArenaService);
  });

  describe('createArenaTrainer', () => {
    it('creates a new arena trainer and writes AuditLog', async () => {
      vi.spyOn(prisma.arenaTrainer, 'findUnique').mockResolvedValue(null);

      const created = {
        id: '664b1f417e2941001a222222',
        key: 'electric_master_1',
        name: 'Electric Master Spark',
        targetRank: 'B',
        level: 120,
        team: ['jolteon', 'raichu'],
        coins: 5000,
        xp: 15000,
        theme: 'Electric',
        ratingDelta: 30,
        cooldownMinutes: 10,
        enabled: true,
        isArchived: false,
        sortOrder: 1,
        dataVersion: 1,
        updatedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const txSpy = vi.spyOn(prisma, '$transaction').mockResolvedValue([created, {}] as any);

      const result = await arenaService.createArenaTrainer(adminId, {
        key: 'electric_master_1',
        name: 'Electric Master Spark',
        targetRank: 'B',
        level: 120,
        team: ['jolteon', 'raichu'],
        coins: 5000,
        xp: 15000,
        theme: 'Electric',
        ratingDelta: 30,
        cooldownMinutes: 10,
        enabled: true,
        reason: 'Adding new electric master challenger',
      });

      expect(txSpy).toHaveBeenCalled();
      expect(result.key).toBe('electric_master_1');
      expect(result.targetRank).toBe('B');
      expect(result.coins).toBe(5000);
      expect(result.team).toEqual(['jolteon', 'raichu']);
    });

    it('rejects creation if trainer key already exists', async () => {
      vi.spyOn(prisma.arenaTrainer, 'findUnique').mockResolvedValue({
        id: '664b1f417e2941001a222223',
        key: 'f_minus_1',
      } as any);

      await expect(
        arenaService.createArenaTrainer(adminId, {
          key: 'f_minus_1',
          name: 'Duplicate Trainer',
          targetRank: 'F',
          level: 15,
          team: ['caterpie'],
          coins: 100,
          xp: 200,
          theme: 'Bug',
          reason: 'Duplicate check attempt',
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateArenaTrainer', () => {
    it('updates trainer team, level, payouts, and writes AuditLog', async () => {
      const existing = {
        id: '664b1f417e2941001a222224',
        key: 'f_minus_1',
        name: 'Rookie Bug Catcher Leo',
        targetRank: 'F',
        level: 15,
        team: ['caterpie', 'scyther'],
        coins: 100,
        xp: 200,
        theme: 'Bug',
        ratingDelta: 25,
        cooldownMinutes: 0,
        enabled: true,
        isArchived: false,
        sortOrder: 1,
        dataVersion: 1,
        updatedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.arenaTrainer, 'findUnique').mockResolvedValue(existing as any);

      const updated = {
        ...existing,
        name: 'Bug Master Leo',
        level: 25,
        team: ['butterfree', 'scizor'],
        coins: 300,
      };

      vi.spyOn(prisma, '$transaction').mockResolvedValue([updated, {}] as any);

      const result = await arenaService.updateArenaTrainer(adminId, 'f_minus_1', {
        name: 'Bug Master Leo',
        level: 25,
        team: ['butterfree', 'scizor'],
        coins: 300,
        reason: 'Promoting Leo with scizor team',
      });

      expect(result.name).toBe('Bug Master Leo');
      expect(result.level).toBe(25);
      expect(result.team).toEqual(['butterfree', 'scizor']);
    });
  });

  describe('archiveArenaTrainer and unarchiveArenaTrainer', () => {
    it('archives trainer by setting isArchived: true, enabled: false', async () => {
      const existing = {
        id: '664b1f417e2941001a222225',
        key: 'e_minus_1',
        name: 'Forest Ranger Rowan',
        targetRank: 'E',
        level: 90,
        team: ['vileplume'],
        coins: 300,
        xp: 600,
        theme: 'Grass',
        enabled: true,
        isArchived: false,
        sortOrder: 2,
        dataVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.arenaTrainer, 'findUnique').mockResolvedValue(existing as any);
      const archived = { ...existing, isArchived: true, enabled: false };
      vi.spyOn(prisma, '$transaction').mockResolvedValue([archived, {}] as any);

      const result = await arenaService.archiveArenaTrainer(
        adminId,
        'e_minus_1',
        'Retiring Rowan temporarily'
      );

      expect(result.isArchived).toBe(true);
      expect(result.enabled).toBe(false);
    });

    it('unarchives trainer restoring isArchived: false, enabled: true', async () => {
      const existing = {
        id: '664b1f417e2941001a222225',
        key: 'e_minus_1',
        name: 'Forest Ranger Rowan',
        targetRank: 'E',
        level: 90,
        team: ['vileplume'],
        coins: 300,
        xp: 600,
        theme: 'Grass',
        enabled: false,
        isArchived: true,
        sortOrder: 2,
        dataVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.arenaTrainer, 'findUnique').mockResolvedValue(existing as any);
      const restored = { ...existing, isArchived: false, enabled: true };
      vi.spyOn(prisma, '$transaction').mockResolvedValue([restored, {}] as any);

      const result = await arenaService.unarchiveArenaTrainer(
        adminId,
        'e_minus_1',
        'Bringing Rowan back to the arena'
      );

      expect(result.isArchived).toBe(false);
      expect(result.enabled).toBe(true);
    });
  });

  describe('updateRankDefinition', () => {
    it('updates rank examiner, level bounds, and promotion rewards', async () => {
      const existingRank = {
        id: '664b1f417e2941001a222226',
        rank: 'F',
        name: 'Rank F',
        minLevel: 1,
        maxLevel: 25,
        requiredWins: 0,
        examinerName: 'F Rank Examiner',
        examinerLevel: 1,
        examinerAce: 'pawmi',
        examinerTeam: ['primarina', 'pawmi'],
        rewardCoins: 300,
        rewardXp: 1000,
        rewardItems: ['Bronze Pearl'],
        enabled: true,
        sortOrder: 1,
        dataVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.rankDefinition, 'findUnique').mockResolvedValue(existingRank as any);

      const updatedRank = {
        ...existingRank,
        rewardCoins: 500,
        rewardItems: ['Bronze Pearl', 'Silver Pearl'],
      };

      vi.spyOn(prisma, '$transaction').mockResolvedValue([updatedRank, {}] as any);

      const result = await arenaService.updateRankDefinition(adminId, 'F', {
        rewardCoins: 500,
        rewardItems: ['Bronze Pearl', 'Silver Pearl'],
        reason: 'Increasing Rank F promotion payout',
      });

      expect(result.rewardCoins).toBe(500);
      expect(result.rewardItems).toEqual(['Bronze Pearl', 'Silver Pearl']);
    });
  });
});
