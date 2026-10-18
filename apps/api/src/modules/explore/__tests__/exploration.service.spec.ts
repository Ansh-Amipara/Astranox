import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';
import { ExplorationService } from '../exploration.service';
import { CacheService } from '../../../core/services/cache.service';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';
import { TrainersRepository } from '../../trainers/trainers.repository';
import { EncounterService } from '../services/encounter.service';

const validUserId = '664b1f417e2941001a111111';

describe('ExplorationService', () => {
  let explorationService: ExplorationService;
  let mockCache: Record<string, any>;
  let mockTrainerSave: any;

  beforeEach(() => {
    container.clearInstances();
    mockCache = {};

    mockTrainerSave = {
      id: '664b1f417e2941001a222222',
      userId: validUserId,
      currentMapId: 'pallet-town',
      posX: 5,
      posY: 5,
      facing: 'DOWN',
      astralCoins: 2000,
      party: [
        {
          id: 'poke-1',
          speciesId: 1,
          currentHp: 20,
          maxHp: 20,
          level: 5,
        },
      ],
    };

    const cacheServiceMock = {
      get: vi.fn(async (key: string) => mockCache[key] ?? null),
      set: vi.fn(async (key: string, val: any) => {
        mockCache[key] = val;
      }),
      del: vi.fn(async (key: string) => {
        delete mockCache[key];
      }),
      isRedisConnected: () => true,
    };

    const flagServiceMock = {
      isEnabled: vi.fn(async () => true),
    };

    const trainersRepoMock = {
      findByUserId: vi.fn(async () => mockTrainerSave),
    };

    const encounterServiceMock = {
      getPublicBattleState: vi.fn(async () => null),
      startWildEncounter: vi.fn(async () => ({
        battleId: 'test-battle-123',
        wildPokemon: { speciesId: 16, speciesName: 'Pidgey', level: 3 },
      })),
    };

    container.registerInstance(CacheService, cacheServiceMock as any);
    container.registerInstance(FeatureFlagService, flagServiceMock as any);
    container.registerInstance(TrainersRepository, trainersRepoMock as any);
    container.registerInstance(EncounterService, encounterServiceMock as any);

    explorationService = container.resolve(ExplorationService);
  });

  it('initializes player position at Pallet Town (5, 5) if no prior session exists', async () => {
    const res = await explorationService.getOrInitState(validUserId);
    expect(res.mapId).toBe('pallet-town');
    expect(res.position).toEqual({ x: 5, y: 5, facing: 'DOWN' });
  });

  it('allows valid movement and advances sequence number after cooldown', async () => {
    mockCache[`explore:${validUserId}`] = {
      mapId: 'pallet-town',
      x: 5,
      y: 5,
      facing: 'DOWN',
      lastMoveTimestamp: Date.now() - 500,
      seq: 0,
      immunityStepsRemaining: 0,
    };

    // Move UP from (5, 5) -> (5, 4)
    const moveRes = await explorationService.move(validUserId, 'UP', 1);
    expect(moveRes.rejected).toBe(false);
    expect(moveRes.position).toEqual({ x: 5, y: 4, facing: 'UP' });
    expect(moveRes.seq).toBe(1);
  });

  it('rejects movement into a WALL tile and keeps coordinate position', async () => {
    // (1, 1) moving LEFT into (0, 1) which is WALL (border)
    mockCache[`explore:${validUserId}`] = {
      mapId: 'pallet-town',
      x: 1,
      y: 1,
      facing: 'DOWN',
      lastMoveTimestamp: Date.now() - 500,
      seq: 0,
      immunityStepsRemaining: 0,
    };

    const moveRes = await explorationService.move(validUserId, 'LEFT', 1);
    expect(moveRes.rejected).toBe(true);
    expect(moveRes.reason).toBe('TILE_BLOCKED');
    expect(moveRes.position.x).toBe(1);
    expect(moveRes.position.y).toBe(1);
    expect(moveRes.position.facing).toBe('LEFT');
  });

  it('rejects movement when cooldown threshold is violated (MOVE_TOO_FAST)', async () => {
    mockCache[`explore:${validUserId}`] = {
      mapId: 'pallet-town',
      x: 5,
      y: 5,
      facing: 'DOWN',
      lastMoveTimestamp: Date.now(), // 0ms elapsed
      seq: 1,
      immunityStepsRemaining: 0,
    };

    const moveRes = await explorationService.move(validUserId, 'UP', 2);
    expect(moveRes.rejected).toBe(true);
    expect(moveRes.reason).toBe('MOVE_TOO_FAST');
  });

  it('rejects movement when user has an active battle', async () => {
    mockCache[`explore:${validUserId}`] = {
      mapId: 'pallet-town',
      x: 5,
      y: 5,
      facing: 'DOWN',
      lastMoveTimestamp: Date.now() - 500,
      seq: 1,
      immunityStepsRemaining: 0,
    };
    mockCache[`active_battle:${validUserId}`] = 'active-battle-xyz';

    const moveRes = await explorationService.move(validUserId, 'UP', 2);
    expect(moveRes.rejected).toBe(true);
    expect(moveRes.reason).toBe('IN_ACTIVE_BATTLE');
  });

  it('transitions through WARP point between Pallet Town and Route 1', async () => {
    // Warp is at (5, 0)
    mockCache[`explore:${validUserId}`] = {
      mapId: 'pallet-town',
      x: 5,
      y: 1,
      facing: 'UP',
      lastMoveTimestamp: Date.now() - 500,
      seq: 1,
      immunityStepsRemaining: 0,
    };

    const moveRes = await explorationService.move(validUserId, 'UP', 2);
    expect(moveRes.rejected).toBe(false);
    expect(moveRes.mapId).toBe('route-1');
    expect(moveRes.position.x).toBe(5);
    expect(moveRes.position.y).toBe(14);
  });

  it('respects post-battle immunity steps and does not trigger encounters during immunity', async () => {
    // Player on Route 1 moving onto Grass tile at (2, 2) with 3 immunity steps
    mockCache[`explore:${validUserId}`] = {
      mapId: 'route-1',
      x: 2,
      y: 1,
      facing: 'DOWN',
      lastMoveTimestamp: Date.now() - 500,
      seq: 1,
      immunityStepsRemaining: 3,
    };

    const moveRes = await explorationService.move(validUserId, 'DOWN', 2);
    expect(moveRes.rejected).toBe(false);
    expect(moveRes.encounter).toBeNull();

    const updated = mockCache[`explore:${validUserId}`];
    expect(updated.immunityStepsRemaining).toBe(2);
  });
});
