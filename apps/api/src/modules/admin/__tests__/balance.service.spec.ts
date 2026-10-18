import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { BalanceService } from '../../balance/balance.service';
import { CacheService } from '../../../core/services/cache.service';
import { prisma } from '../../../core/db/prisma';
import {
  BALANCE_DEFAULTS,
  BATTLE_CONSTANTS,
  ECONOMY_CONSTANTS,
  EXPLORATION_CONSTANTS,
} from '@astranox/constants';

describe('BalanceService', () => {
  let balanceService: BalanceService;
  let mockCache: Record<string, any>;

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
    balanceService = container.resolve(BalanceService);
  });

  describe('get effective balance', () => {
    it('returns canonical defaults when no database override exists', async () => {
      vi.spyOn(prisma.balanceConfig, 'findFirst').mockResolvedValue(null as any);

      const effective = await balanceService.get('battle');
      expect(effective).toEqual(BATTLE_CONSTANTS);
    });

    it('merges section defaults with active database overrides', async () => {
      vi.spyOn(prisma.balanceConfig, 'findFirst').mockResolvedValue({
        id: 'cfg-1',
        section: 'battle',
        version: 2,
        status: 'active',
        values: {
          CRITICAL_HIT_MULTIPLIER: 2.0, // Default is 1.5
        },
      } as any);

      const effective = await balanceService.get('battle');
      expect(effective.CRITICAL_HIT_MULTIPLIER).toBe(2.0);
      expect(effective.STAB_MULTIPLIER).toBe(BATTLE_CONSTANTS.STAB_MULTIPLIER);
    });

    it('falls back to defaults if database override contains corrupt/invalid values', async () => {
      vi.spyOn(prisma.balanceConfig, 'findFirst').mockResolvedValue({
        id: 'cfg-corrupt',
        section: 'battle',
        version: 3,
        status: 'active',
        values: {
          CRITICAL_HIT_MULTIPLIER: -999, // Fails z.number().min(1.0)
        },
      } as any);

      const effective = await balanceService.get('battle');
      expect(effective).toEqual(BATTLE_CONSTANTS);
    });

    it('historical snapshot loads specific version without affecting current active version', async () => {
      vi.spyOn(prisma.balanceConfig, 'findUnique').mockResolvedValue({
        id: 'cfg-snap-1',
        section: 'exploration',
        version: 1,
        status: 'archived',
        values: {
          MOVE_COOLDOWN_MS: 300, // Default is 180
        },
      } as any);

      const snapshot = await balanceService.get('exploration', 1);
      expect(snapshot.MOVE_COOLDOWN_MS).toBe(300);
      expect(snapshot.ENCOUNTER_CHANCE_GRASS).toBe(EXPLORATION_CONSTANTS.ENCOUNTER_CHANCE_GRASS);
    });
  });

  describe('preview diff calculation and extreme thresholds', () => {
    it('identifies parameter modifications and calculates percentage changes', async () => {
      (vi.spyOn(prisma.balanceConfig, 'findFirst') as any).mockImplementation(async (args: any) => {
        if (args?.where?.status === 'draft') {
          return {
            id: '664b1f417e2941001a111111',
            section: 'economy',
            version: 2,
            status: 'draft',
            values: {
              STARTER_ASTRAL_COINS: 4500, // Default 3000 => +50%
            },
          } as any;
        }
        return null;
      });

      const preview = await balanceService.previewDraft('economy');

      expect(preview.hasChanges).toBe(true);
      expect(preview.hasExtremeChanges).toBe(false);
      const diffItem = preview.diffs.find((d) => d.field === 'STARTER_ASTRAL_COINS');
      expect(diffItem).toBeDefined();
      expect(diffItem?.currentActiveValue).toBe(3000);
      expect(diffItem?.draftValue).toBe(4500);
      expect(diffItem?.percentChange).toBe(50);
    });

    it('flags hasExtremeChanges when parameter delta exceeds 50%', async () => {
      (vi.spyOn(prisma.balanceConfig, 'findFirst') as any).mockImplementation(async (args: any) => {
        if (args?.where?.status === 'draft') {
          return {
            id: '664b1f417e2941001a111111',
            section: 'economy',
            version: 2,
            status: 'draft',
            values: {
              STARTER_ASTRAL_COINS: 9000, // Default 3000 => +200% change (> 50%)
            },
          } as any;
        }
        return null;
      });

      const preview = await balanceService.previewDraft('economy');

      expect(preview.hasExtremeChanges).toBe(true);
      expect(preview.warnings.length).toBeGreaterThan(0);
      const diffItem = preview.diffs.find((d) => d.field === 'STARTER_ASTRAL_COINS');
      expect(diffItem?.isExtreme).toBe(true);
    });
  });

  describe('draft, publish, and audit logging', () => {
    it('saveDraft creates or updates a draft config without changing active version', async () => {
      vi.spyOn(prisma.balanceConfig, 'findFirst').mockResolvedValue(null as any);
      const createSpy = vi.spyOn(prisma.balanceConfig, 'create').mockResolvedValue({
        id: '664b1f417e2941001a111111',
        section: 'battle',
        version: 2,
        status: 'draft',
        values: { CRITICAL_HIT_MULTIPLIER: 1.8 },
      } as any);

      const overview = await balanceService.saveDraft('admin-123', 'battle', {
        CRITICAL_HIT_MULTIPLIER: 1.8,
      });

      expect(overview.section).toBe('battle');
      expect(createSpy).toHaveBeenCalled();
    });

    it('publishDraft blocks extreme changes unless confirmExtreme is true', async () => {
      (vi.spyOn(prisma.balanceConfig, 'findFirst') as any).mockImplementation(async (args: any) => {
        if (args?.where?.status === 'draft') {
          return {
            id: '664b1f417e2941001a222222',
            section: 'economy',
            version: 2,
            status: 'draft',
            values: {
              STARTER_ASTRAL_COINS: 10000, // Extreme +233% (> 50%)
            },
          } as any;
        }
        return {
          id: '664b1f417e2941001a111111',
          section: 'economy',
          version: 1,
          status: 'active',
          values: {},
        } as any;
      });

      await expect(
        balanceService.publishDraft(
          'admin-123',
          'economy',
          'Major buff for testing',
          false
        )
      ).rejects.toThrow(/extreme balance change/i);
    });

    it('publishDraft commits transaction: archives old active, sets new active, and creates AuditLog', async () => {
      (vi.spyOn(prisma.balanceConfig, 'findFirst') as any).mockImplementation(async (args: any) => {
        if (args?.where?.status === 'draft') {
          return {
            id: 'cfg-draft',
            section: 'battle',
            version: 2,
            status: 'draft',
            values: { CRITICAL_HIT_MULTIPLIER: 1.75 },
          } as any;
        }
        return {
          id: 'cfg-v1',
          section: 'battle',
          version: 1,
          status: 'active',
          values: {},
        } as any;
      });

      const txSpy = vi.spyOn(prisma, '$transaction').mockResolvedValue([] as any);

      const overview = await balanceService.publishDraft(
        'admin-user-id',
        'battle',
        'Tuned crit multiplier for test',
        true,
        'req-xyz'
      );

      expect(overview.section).toBe('battle');
      expect(txSpy).toHaveBeenCalled();
    });
  });

  describe('rollback and reset', () => {
    it('rollback creates a new version from target historical version', async () => {
      vi.spyOn(prisma.balanceConfig, 'findUnique').mockResolvedValue({
        id: 'cfg-v1',
        section: 'battle',
        version: 1,
        status: 'archived',
        values: { CRITICAL_HIT_MULTIPLIER: 1.6 },
      } as any);

      vi.spyOn(prisma.balanceConfig, 'findFirst').mockResolvedValue({
        id: 'cfg-v2',
        section: 'battle',
        version: 2,
        status: 'active',
        values: { CRITICAL_HIT_MULTIPLIER: 2.0 },
      } as any);

      const txSpy = vi.spyOn(prisma, '$transaction').mockResolvedValue([] as any);

      const res = await balanceService.rollback(
        'admin-user-id',
        'battle',
        1,
        'Reverting due to balance complaints',
        'req-xyz'
      );

      expect(res.section).toBe('battle');
      expect(txSpy).toHaveBeenCalled();
    });

    it('resetToDefaults archives active overrides and logs audit entry', async () => {
      vi.spyOn(prisma.balanceConfig, 'findFirst').mockResolvedValue({
        id: 'cfg-v1',
        section: 'battle',
        version: 1,
        status: 'active',
        values: { CRITICAL_HIT_MULTIPLIER: 2.0 },
      } as any);

      const txSpy = vi.spyOn(prisma, '$transaction').mockResolvedValue([] as any);

      const res = await balanceService.resetToDefaults(
        'admin-user-id',
        'battle',
        'Resetting to canonical defaults',
        'req-xyz'
      );

      expect(res.section).toBe('battle');
      expect(txSpy).toHaveBeenCalled();
    });
  });
});
