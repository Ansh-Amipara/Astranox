import { injectable } from 'tsyringe';
import { BattleEngineState, TurnEvent } from '@astranox/battle-engine';
import { CURRENT_DATA_VERSION, EXPLORATION_CONSTANTS } from '@astranox/constants';
import { prisma } from '../../../core/db/prisma';
import { AuditService } from '../../../core/services/audit.service';
import { CacheService } from '../../../core/services/cache.service';
import { RedisLockService } from '../../../core/services/redis-lock.service';
import { logger } from '../../../config/logger';

export interface FinalizeResult {
  outcome: 'WON' | 'CAPTURED' | 'DEFEATED' | 'FLED';
  rewards?: {
    coins?: number;
    xp?: number;
    penaltyCoins?: number;
  };
  capturedPokemon?: any;
  respawnPosition?: {
    mapId: string;
    x: number;
    y: number;
  };
}

@injectable()
export class BattleFinalizerService {
  constructor(
    private audit: AuditService,
    private cache: CacheService,
    private lockService: RedisLockService
  ) {}

  /**
   * Finalizes an active battle session exactly once.
   * Guarded by Redlock and idempotency check.
   */
  async finalize(
    userId: string,
    state: BattleEngineState,
    outcome: 'WON' | 'CAPTURED' | 'DEFEATED' | 'FLED',
    _lastEvents: TurnEvent[]
  ): Promise<FinalizeResult> {
    const lockKey = `lock:battle:${state.battleId}`;
    const finalizedFlagKey = `finalized:${state.battleId}`;

    return this.lockService.withLock(lockKey, 10000, async () => {
      // Idempotency safeguard: check if already finalized
      const alreadyFinalized = await this.cache.get<boolean>(finalizedFlagKey);
      if (alreadyFinalized) {
        logger.warn(`Battle ${state.battleId} was already finalized. Skipping double-finalization.`);
        return { outcome };
      }

      const trainerSave = await prisma.trainerSave.findUnique({
        where: { userId },
        include: { party: true, inventory: true },
      });

      if (!trainerSave) {
        throw new Error(`Trainer save not found for user ${userId}`);
      }

      let result: FinalizeResult = { outcome };

      await prisma.$transaction(async (tx) => {
        if (outcome === 'WON') {
          const coinsEarned = state.wildPokemon.level * EXPLORATION_CONSTANTS.WIN_CURRENCY_MULTIPLIER;
          const xpEarned = Math.floor((state.wildPokemon.baseExp || 64) * (state.wildPokemon.level / 5));

          const currentCoins = trainerSave.astralCoins;
          const newCoins = currentCoins + coinsEarned;

          await tx.trainerSave.update({
            where: { id: trainerSave.id },
            data: {
              astralCoins: newCoins,
            },
          });

          // Sync party HP & XP
          for (const partyMember of state.playerParty) {
            await tx.ownedPokemon.update({
              where: { id: partyMember.id },
              data: {
                currentXp: { increment: xpEarned },
              },
            });
          }

          // Audit Log
          await this.audit.log(
            {
              action: 'WILD_BATTLE_VICTORY',
              entityType: 'TrainerSave',
              entityId: trainerSave.id,
              actorId: userId,
              actorType: 'user',
              reason: `Won wild battle against ${state.wildPokemon.speciesName} Lv.${state.wildPokemon.level}`,
              before: { astralCoins: currentCoins },
              after: { astralCoins: newCoins },
              meta: { coinsEarned, xpEarned, battleId: state.battleId },
            },
            tx
          );

          // Encounter History
          await tx.encounterHistory.create({
            data: {
              userId,
              trainerId: trainerSave.id,
              mapId: 'route-1',
              speciesId: state.wildPokemon.speciesId,
              level: state.wildPokemon.level,
              outcome: 'WON',
              battleId: state.battleId,
            },
          });

          result.rewards = { coins: coinsEarned, xp: xpEarned };
        } else if (outcome === 'CAPTURED') {
          const coinsEarned = EXPLORATION_CONSTANTS.CAPTURE_CURRENCY_REWARD;
          const currentPartyCount = trainerSave.party.length;
          const isParty = currentPartyCount < 6;

          let position = 0;
          if (isParty) {
            position = currentPartyCount;
          } else {
            const maxPos = await tx.ownedPokemon.aggregate({
              where: { trainerId: trainerSave.id, isParty: false },
              _max: { position: true },
            });
            position = (maxPos._max.position ?? -1) + 1;
          }

          // Generate IVs
          const ivHp = Math.floor(Math.random() * 32);
          const ivAttack = Math.floor(Math.random() * 32);
          const ivDefense = Math.floor(Math.random() * 32);
          const ivSpAtk = Math.floor(Math.random() * 32);
          const ivSpDef = Math.floor(Math.random() * 32);
          const ivSpeed = Math.floor(Math.random() * 32);

          const newPokemon = await tx.ownedPokemon.create({
            data: {
              trainerId: trainerSave.id,
              speciesId: state.wildPokemon.speciesId,
              level: state.wildPokemon.level,
              isParty,
              position,
              ivHp,
              ivAttack,
              ivDefense,
              ivSpAtk,
              ivSpDef,
              ivSpeed,
              dataVersion: CURRENT_DATA_VERSION.OWNED_POKEMON,
            },
          });

          // Save equipped moves
          if (state.wildPokemon.moves && state.wildPokemon.moves.length > 0) {
            await tx.pokemonEquippedMoves.createMany({
              data: state.wildPokemon.moves.map((m, idx) => ({
                ownedPokemonId: newPokemon.id,
                moveId: m.id,
                slot: idx,
              })),
            });
          }

          // Grant Astral Coins
          await tx.trainerSave.update({
            where: { id: trainerSave.id },
            data: {
              astralCoins: { increment: coinsEarned },
            },
          });

          // Audit Log
          await this.audit.log(
            {
              action: 'WILD_POKEMON_CAPTURED',
              entityType: 'OwnedPokemon',
              entityId: newPokemon.id,
              actorId: userId,
              actorType: 'user',
              reason: `Captured ${state.wildPokemon.speciesName} Lv.${state.wildPokemon.level}`,
              meta: {
                speciesId: state.wildPokemon.speciesId,
                level: state.wildPokemon.level,
                isParty,
                battleId: state.battleId,
              },
            },
            tx
          );

          // Encounter History
          await tx.encounterHistory.create({
            data: {
              userId,
              trainerId: trainerSave.id,
              mapId: 'route-1',
              speciesId: state.wildPokemon.speciesId,
              level: state.wildPokemon.level,
              outcome: 'CAPTURED',
              battleId: state.battleId,
            },
          });

          result.rewards = { coins: coinsEarned };
          result.capturedPokemon = {
            id: newPokemon.id,
            speciesId: newPokemon.speciesId,
            level: newPokemon.level,
            speciesName: state.wildPokemon.speciesName,
            isParty,
          };
        } else if (outcome === 'DEFEATED') {
          const currentCoins = trainerSave.astralCoins;
          const penalty = Math.min(
            Math.floor(currentCoins * EXPLORATION_CONSTANTS.DEFEAT_CURRENCY_PENALTY_RATIO),
            EXPLORATION_CONSTANTS.DEFEAT_CURRENCY_PENALTY_CAP
          );
          const newCoins = Math.max(0, currentCoins - penalty);

          const spawnMapId = (trainerSave as any).lastHealMapId || EXPLORATION_CONSTANTS.DEFAULT_SPAWN_MAP_ID;
          const spawnX = (trainerSave as any).lastHealX ?? EXPLORATION_CONSTANTS.DEFAULT_SPAWN_X;
          const spawnY = (trainerSave as any).lastHealY ?? EXPLORATION_CONSTANTS.DEFAULT_SPAWN_Y;

          await tx.trainerSave.update({
            where: { id: trainerSave.id },
            data: {
              astralCoins: newCoins,
              currentMapId: spawnMapId,
              posX: spawnX,
              posY: spawnY,
              facing: EXPLORATION_CONSTANTS.DEFAULT_SPAWN_FACING,
            },
          });

          // Audit Log
          await this.audit.log(
            {
              action: 'WILD_BATTLE_DEFEATED',
              entityType: 'TrainerSave',
              entityId: trainerSave.id,
              actorId: userId,
              actorType: 'user',
              reason: 'Party wiped out in wild battle. Applied respawn and currency penalty.',
              before: { astralCoins: currentCoins },
              after: { astralCoins: newCoins },
              meta: { penaltyCoins: penalty, battleId: state.battleId },
            },
            tx
          );

          // Encounter History
          await tx.encounterHistory.create({
            data: {
              userId,
              trainerId: trainerSave.id,
              mapId: 'route-1',
              speciesId: state.wildPokemon.speciesId,
              level: state.wildPokemon.level,
              outcome: 'DEFEATED',
              battleId: state.battleId,
            },
          });

          result.rewards = { penaltyCoins: penalty };
          result.respawnPosition = {
            mapId: spawnMapId,
            x: spawnX,
            y: spawnY,
          };
        } else if (outcome === 'FLED') {
          // Encounter History
          await tx.encounterHistory.create({
            data: {
              userId,
              trainerId: trainerSave.id,
              mapId: 'route-1',
              speciesId: state.wildPokemon.speciesId,
              level: state.wildPokemon.level,
              outcome: 'FLED',
              battleId: state.battleId,
            },
          });
        }
      });

      // Mark finalized in Redis
      await this.cache.set(finalizedFlagKey, true, 86400);

      // Clean up active battle pointer
      await this.cache.del(`active_battle:${userId}`);

      // Set encounter immunity steps in exploration session
      const exploreKey = `explore:${userId}`;
      const exploreSession = await this.cache.get<any>(exploreKey);
      if (exploreSession) {
        exploreSession.immunityStepsRemaining = EXPLORATION_CONSTANTS.POST_BATTLE_IMMUNITY_STEPS;
        if (result.respawnPosition) {
          exploreSession.mapId = result.respawnPosition.mapId;
          exploreSession.x = result.respawnPosition.x;
          exploreSession.y = result.respawnPosition.y;
          exploreSession.facing = EXPLORATION_CONSTANTS.DEFAULT_SPAWN_FACING;
        }
        await this.cache.set(exploreKey, exploreSession, 86400);
      }

      return result;
    });
  }
}
