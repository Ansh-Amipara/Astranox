import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { WildBattleService } from '../services/wild-battle.service';
import { BattleFinalizerService } from '../services/battle-finalizer.service';
import { EncounterService } from '../../explore/services/encounter.service';
import { CacheService } from '../../../core/services/cache.service';
import { RedisLockService } from '../../../core/services/redis-lock.service';
import { AuditService } from '../../../core/services/audit.service';
import { prisma } from '../../../core/db/prisma';

const validUserId = '664b1f417e2941001a333333';
const validTrainerId = '664b1f417e2941001a444444';

describe('WildBattleService & BattleFinalizerService', () => {
  let wildBattleService: WildBattleService;
  let finalizerService: BattleFinalizerService;
  let mockCache: Record<string, any>;
  let mockAuditLogs: any[];

  beforeEach(() => {
    container.clearInstances();
    mockCache = {};
    mockAuditLogs = [];

    const cacheMock = {
      get: vi.fn(async (key: string) => mockCache[key] ?? null),
      set: vi.fn(async (key: string, val: any) => {
        mockCache[key] = val;
      }),
      del: vi.fn(async (key: string) => {
        delete mockCache[key];
      }),
      isRedisConnected: () => true,
    };

    const lockServiceMock = {
      withLock: vi.fn(async (_key: string, _ttl: number, fn: () => Promise<any>) => fn()),
    };

    const auditMock = {
      log: vi.fn(async (entry: any) => {
        mockAuditLogs.push(entry);
      }),
    };

    container.registerInstance(CacheService, cacheMock as any);
    container.registerInstance(RedisLockService, lockServiceMock as any);
    container.registerInstance(AuditService, auditMock as any);

    finalizerService = container.resolve(BattleFinalizerService);
    wildBattleService = container.resolve(WildBattleService);
  });

  it('resolves RUN action immediately and marks outcome FLED', async () => {
    const battleId = 'wb_run_test';
    const mockState = {
      battleId,
      turnNumber: 1,
      playerActive: {
        id: 'p1',
        speciesId: 1,
        speciesName: 'Bulbasaur',
        level: 5,
        types: ['grass', 'poison'],
        maxHp: 20,
        currentHp: 20,
        attack: 10,
        defense: 10,
        spAtk: 10,
        spDef: 10,
        speed: 10,
        status: 'none',
        moves: [{ id: 33, name: 'Tackle', power: 40, accuracy: 100, type: 'normal', damageClass: 'physical' }],
      },
      playerParty: [],
      wildPokemon: {
        id: 'w1',
        speciesId: 16,
        speciesName: 'Pidgey',
        level: 3,
        types: ['normal', 'flying'],
        maxHp: 16,
        currentHp: 16,
        attack: 8,
        defense: 8,
        spAtk: 8,
        spDef: 8,
        speed: 8,
        status: 'none',
        moves: [{ id: 33, name: 'Tackle', power: 40, accuracy: 100, type: 'normal', damageClass: 'physical' }],
        catchRate: 255,
      },
      outcome: null,
      seed: 54321,
    };

    mockCache[`battle:${battleId}`] = mockState;

    vi.spyOn(prisma.trainerSave, 'findUnique').mockResolvedValue({
      id: validTrainerId,
      userId: validUserId,
      inventory: [],
      party: [],
      astralCoins: 1000,
    } as any);

    vi.spyOn(prisma, '$transaction').mockImplementation(async (fn: any) => {
      return fn({
        encounterHistory: { create: vi.fn() },
      });
    });

    const res = await wildBattleService.submitAction(validUserId, battleId, { type: 'RUN' });
    expect(res.outcome).toBe('FLED');
    expect(res.events.some((e) => e.type === 'run_attempt' && e.success)).toBe(true);
  });

  it('rejects USE_MOVE if move is not learned by active Pokemon', async () => {
    const battleId = 'wb_move_test';
    const mockState = {
      battleId,
      turnNumber: 1,
      playerActive: {
        id: 'p1',
        speciesId: 1,
        speciesName: 'Bulbasaur',
        moves: [{ id: 33, name: 'Tackle', power: 40, accuracy: 100, type: 'normal', damageClass: 'physical' }],
      },
      playerParty: [],
      wildPokemon: { moves: [] },
      outcome: null,
      seed: 11111,
    };

    mockCache[`battle:${battleId}`] = mockState;

    vi.spyOn(prisma.trainerSave, 'findUnique').mockResolvedValueOnce({
      id: validTrainerId,
      userId: validUserId,
      inventory: [],
      party: [],
    } as any);

    await expect(
      wildBattleService.submitAction(validUserId, battleId, { type: 'USE_MOVE', moveId: 9999 })
    ).rejects.toThrow('Move ID 9999 is not available');
  });

  it('rejects THROW_BALL if player has no balls in inventory', async () => {
    const battleId = 'wb_noball_test';
    const mockState = {
      battleId,
      turnNumber: 1,
      playerActive: { id: 'p1', moves: [] },
      playerParty: [],
      wildPokemon: { moves: [] },
      outcome: null,
      seed: 22222,
    };

    mockCache[`battle:${battleId}`] = mockState;

    vi.spyOn(prisma.trainerSave, 'findUnique').mockResolvedValueOnce({
      id: validTrainerId,
      userId: validUserId,
      inventory: [],
      party: [],
    } as any);

    await expect(
      wildBattleService.submitAction(validUserId, battleId, { type: 'THROW_BALL', ballType: 'ultra-ball' })
    ).rejects.toThrow('You do not have any ultra-ball');
  });
});
