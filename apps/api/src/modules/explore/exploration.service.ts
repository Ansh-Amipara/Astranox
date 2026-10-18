import { injectable } from 'tsyringe';
import { canMove, getMapById, rollEncounter, MapDirection, Position } from '@astranox/game-map';
import { EXPLORATION_CONSTANTS } from '@astranox/constants';
import { CacheService } from '../../core/services/cache.service';
import { FeatureFlagService } from '../../core/services/feature-flag.service';
import { TrainersRepository } from '../trainers/trainers.repository';
import { EncounterService } from './services/encounter.service';
import { AppError, FeatureDisabledError, NotFoundError, ValidationError } from '../../core/errors/AppError';
import { prisma } from '../../core/db/prisma';

export interface RedisExploreSession {
  mapId: string;
  x: number;
  y: number;
  facing: MapDirection;
  lastMoveTimestamp: number;
  seq: number;
  immunityStepsRemaining: number;
}

@injectable()
export class ExplorationService {
  constructor(
    private cache: CacheService,
    private flagService: FeatureFlagService,
    private trainersRepo: TrainersRepository,
    private encounterService: EncounterService
  ) {}

  private getSessionKey(userId: string): string {
    return `explore:${userId}`;
  }

  private getActiveBattleKey(userId: string): string {
    return `active_battle:${userId}`;
  }

  /**
   * Initializes or loads the player's exploration state.
   */
  async getOrInitState(userId: string, requestedMapId?: string) {
    const isEnabled = await this.flagService.isEnabled('exploration');
    if (!isEnabled) {
      throw new FeatureDisabledError("The 'exploration' feature is currently disabled.");
    }

    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found.');
    }

    // Check Redis for active session
    const key = this.getSessionKey(userId);
    let session = await this.cache.get<RedisExploreSession>(key);

    if (!session) {
      const mapId = requestedMapId || (trainerSave as any).currentMapId || EXPLORATION_CONSTANTS.DEFAULT_SPAWN_MAP_ID;
      const x = (trainerSave as any).posX ?? EXPLORATION_CONSTANTS.DEFAULT_SPAWN_X;
      const y = (trainerSave as any).posY ?? EXPLORATION_CONSTANTS.DEFAULT_SPAWN_Y;
      const facing = ((trainerSave as any).facing as MapDirection) || EXPLORATION_CONSTANTS.DEFAULT_SPAWN_FACING;

      session = {
        mapId,
        x,
        y,
        facing,
        lastMoveTimestamp: Date.now(),
        seq: 0,
        immunityStepsRemaining: 0,
      };

      await this.cache.set(key, session, 86400); // 24 hours TTL
    }

    // Check if player has an active wild battle to resume
    const activeBattleId = await this.cache.get<string>(this.getActiveBattleKey(userId));
    let activeBattle = null;
    if (activeBattleId) {
      activeBattle = await this.encounterService.getPublicBattleState(activeBattleId);
    }

    return {
      mapId: session.mapId,
      position: {
        x: session.x,
        y: session.y,
        facing: session.facing,
      },
      activeBattle,
    };
  }

  /**
   * Authoritatively processes a proposed move action.
   */
  async move(userId: string, direction: MapDirection, clientSeq: number) {
    const isEnabled = await this.flagService.isEnabled('exploration');
    if (!isEnabled) {
      throw new FeatureDisabledError("The 'exploration' feature is currently disabled.");
    }

    const key = this.getSessionKey(userId);
    let session = await this.cache.get<RedisExploreSession>(key);

    if (!session) {
      const init = await this.getOrInitState(userId);
      session = {
        mapId: init.mapId,
        x: init.position.x,
        y: init.position.y,
        facing: init.position.facing,
        lastMoveTimestamp: Date.now(),
        seq: clientSeq,
        immunityStepsRemaining: 0,
      };
    }

    // 1. Check if user is locked in an active battle
    const activeBattleId = await this.cache.get<string>(this.getActiveBattleKey(userId));
    if (activeBattleId) {
      return {
        rejected: true,
        reason: 'IN_ACTIVE_BATTLE',
        position: { x: session.x, y: session.y, facing: session.facing },
        seq: clientSeq,
      };
    }

    // 2. Enforce move cooldown / rate limiting
    const now = Date.now();
    const timeDelta = now - session.lastMoveTimestamp;
    if (timeDelta < EXPLORATION_CONSTANTS.MOVE_COOLDOWN_MS) {
      return {
        rejected: true,
        reason: 'MOVE_TOO_FAST',
        position: { x: session.x, y: session.y, facing: session.facing },
        seq: clientSeq,
      };
    }

    // 3. Load map and validate collision
    const map = getMapById(session.mapId);
    if (!map) {
      return {
        rejected: true,
        reason: 'UNKNOWN_MAP',
        position: { x: session.x, y: session.y, facing: session.facing },
        seq: clientSeq,
      };
    }

    const currentPos: Position = { x: session.x, y: session.y, facing: session.facing };
    const moveRes = canMove(map, currentPos, direction);

    if (!moveRes.allowed) {
      // Update facing even when move blocked
      session.facing = direction;
      session.lastMoveTimestamp = now;
      session.seq = clientSeq;
      await this.cache.set(key, session, 86400);

      return {
        rejected: true,
        reason: moveRes.reason || 'TILE_BLOCKED',
        position: { x: session.x, y: session.y, facing: direction },
        seq: clientSeq,
      };
    }

    // 4. Update coordinates (handle warps)
    let nextMapId = session.mapId;
    let nextX = moveRes.nextPosition.x;
    let nextY = moveRes.nextPosition.y;
    let nextFacing = moveRes.nextPosition.facing;

    if (moveRes.warp) {
      nextMapId = moveRes.warp.targetMapId;
      nextX = moveRes.warp.targetX;
      nextY = moveRes.warp.targetY;
      nextFacing = moveRes.warp.targetFacing ?? direction;
    }

    // Update session
    session.mapId = nextMapId;
    session.x = nextX;
    session.y = nextY;
    session.facing = nextFacing;
    session.lastMoveTimestamp = now;
    session.seq = clientSeq;

    // 5. Encounter Check
    let encounter = null;
    const targetMap = getMapById(nextMapId);

    if (session.immunityStepsRemaining > 0) {
      session.immunityStepsRemaining -= 1;
    } else if (targetMap && moveRes.tile === 'GRASS') {
      // Check if player has conscious Pokémon
      const trainerSave = await this.trainersRepo.findByUserId(userId);
      const party = (trainerSave as any)?.party || [];
      const hasConscious = party.some((p: any) => p.currentHp === undefined || p.currentHp > 0);

      if (hasConscious) {
        const rollRes = rollEncounter(
          targetMap,
          nextX,
          nextY,
          () => Math.random(),
          EXPLORATION_CONSTANTS.ENCOUNTER_CHANCE_GRASS
        );

        if (rollRes.triggered && rollRes.encounter) {
          encounter = await this.encounterService.startWildEncounter(
            userId,
            trainerSave,
            rollRes.encounter.speciesId,
            rollRes.encounter.level
          );
        }
      }
    }

    await this.cache.set(key, session, 86400);

    // Save checkpoint to database on warps
    if (moveRes.warp) {
      await prisma.trainerSave.updateMany({
        where: { userId },
        data: {
          currentMapId: nextMapId,
          posX: nextX,
          posY: nextY,
          facing: nextFacing,
        },
      });
    }

    return {
      rejected: false,
      seq: clientSeq,
      position: {
        x: nextX,
        y: nextY,
        facing: nextFacing,
      },
      mapId: nextMapId,
      encounter,
    };
  }

  /**
   * Updates immunity steps after a battle completes.
   */
  async grantEncounterImmunity(userId: string, steps: number = EXPLORATION_CONSTANTS.POST_BATTLE_IMMUNITY_STEPS) {
    const key = this.getSessionKey(userId);
    const session = await this.cache.get<RedisExploreSession>(key);
    if (session) {
      session.immunityStepsRemaining = steps;
      await this.cache.set(key, session, 86400);
    }
  }

  /**
   * Resets player position back to their last heal point on defeat.
   */
  async respawnPlayer(userId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    const spawnMapId = (trainerSave as any)?.lastHealMapId || EXPLORATION_CONSTANTS.DEFAULT_SPAWN_MAP_ID;
    const spawnX = (trainerSave as any)?.lastHealX ?? EXPLORATION_CONSTANTS.DEFAULT_SPAWN_X;
    const spawnY = (trainerSave as any)?.lastHealY ?? EXPLORATION_CONSTANTS.DEFAULT_SPAWN_Y;

    const key = this.getSessionKey(userId);
    const session: RedisExploreSession = {
      mapId: spawnMapId,
      x: spawnX,
      y: spawnY,
      facing: EXPLORATION_CONSTANTS.DEFAULT_SPAWN_FACING,
      lastMoveTimestamp: Date.now(),
      seq: 0,
      immunityStepsRemaining: EXPLORATION_CONSTANTS.POST_BATTLE_IMMUNITY_STEPS,
    };

    await this.cache.set(key, session, 86400);

    await prisma.trainerSave.updateMany({
      where: { userId },
      data: {
        currentMapId: spawnMapId,
        posX: spawnX,
        posY: spawnY,
        facing: session.facing,
      },
    });

    return session;
  }
}
