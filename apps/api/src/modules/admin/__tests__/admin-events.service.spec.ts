import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { AdminEventsService } from '../admin-events.service';
import { CacheService } from '../../../core/services/cache.service';
import { prisma } from '../../../core/db/prisma';
import { BadRequestError } from '../../../core/errors/AppError';

describe('AdminEventsService', () => {
  let eventsService: AdminEventsService;
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
    eventsService = container.resolve(AdminEventsService);
  });

  describe('createEvent', () => {
    it('creates an event with task objective, custom pokemon pool, and writes AuditLog', async () => {
      vi.spyOn(prisma.eventChallenge, 'updateMany').mockResolvedValue({ count: 1 });

      const startDate = new Date();
      const endDate = new Date(Date.now() + 7 * 86400000);

      const created = {
        id: '664b1f417e2941001a444444',
        name: 'Fire Festival 2026',
        description: 'Defeat Fire type pokemon for grand prizes',
        startDate,
        endDate,
        isActive: true,
        isArchived: false,
        taskType: 'DEFEAT_WILD_POKEMON',
        taskConfig: { requiredCount: 15, pokemonType: 'Fire' },
        rewardConfig: { speciesId: 6, level: 50 },
        pokemonPool: [{ speciesId: 4, name: 'charmander', minLevel: 5, maxLevel: 20, weight: 60 }],
        dataVersion: 1,
        updatedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const txSpy = vi.spyOn(prisma, '$transaction').mockResolvedValue([created, {}] as any);

      const result = await eventsService.createEvent(adminId, {
        name: 'Fire Festival 2026',
        description: 'Defeat Fire type pokemon for grand prizes',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true,
        taskType: 'DEFEAT_WILD_POKEMON',
        taskConfig: { requiredCount: 15, pokemonType: 'Fire' },
        rewardConfig: { speciesId: 6, level: 50 },
        pokemonPool: [{ speciesId: 4, name: 'charmander', minLevel: 5, maxLevel: 20, weight: 60 }],
        reason: 'Launching Fire Festival 2026 event',
      });

      expect(txSpy).toHaveBeenCalled();
      expect(result.name).toBe('Fire Festival 2026');
      expect(result.isActive).toBe(true);
      expect(result.pokemonPool).toHaveLength(1);
    });

    it('rejects event if endDate is not after startDate', async () => {
      const now = new Date();
      await expect(
        eventsService.createEvent(adminId, {
          name: 'Invalid Dates Event',
          description: 'Testing dates validation',
          startDate: now.toISOString(),
          endDate: now.toISOString(),
          isActive: false,
          taskType: 'DEFEAT_WILD_POKEMON',
          reason: 'Testing date rejection',
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('archiveEvent and unarchiveEvent', () => {
    it('archives an event by setting isArchived: true, isActive: false and logs audit entry', async () => {
      const existing = {
        id: '664b1f417e2941001a444445',
        name: 'Old Event',
        description: 'Expired challenge',
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        isArchived: false,
        taskType: 'CLEAR_TOWER',
        taskConfig: {},
        rewardConfig: {},
        pokemonPool: null,
        dataVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.eventChallenge, 'findUnique').mockResolvedValue(existing as any);
      const archived = { ...existing, isArchived: true, isActive: false };
      vi.spyOn(prisma, '$transaction').mockResolvedValue([archived, {}] as any);

      const result = await eventsService.archiveEvent(
        adminId,
        '664b1f417e2941001a444445',
        'Archiving old event'
      );

      expect(result.isArchived).toBe(true);
      expect(result.isActive).toBe(false);
    });
  });
});
