import { injectable } from 'tsyringe';
import { BattleEngineState, BattlePokemon, PlayerAction, resolveTurn } from '@astranox/battle-engine';
import { CacheService } from '../../../core/services/cache.service';
import { BalanceService } from '../../balance/balance.service';
import { RedisLockService } from '../../../core/services/redis-lock.service';
import { prisma } from '../../../core/db/prisma';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { BattleFinalizerService } from './battle-finalizer.service';

@injectable()
export class WildBattleService {
  constructor(
    private cache: CacheService,
    private balanceService: BalanceService,
    private lockService: RedisLockService,
    private finalizer: BattleFinalizerService
  ) {}

  private getBattleKey(battleId: string): string {
    return `battle:${battleId}`;
  }

  /**
   * Authoritatively submits and resolves a turn action for an active wild battle.
   */
  async submitAction(userId: string, battleId: string, action: PlayerAction) {
    const lockKey = `lock:battle:${battleId}`;

    return this.lockService.withLock(lockKey, 5000, async () => {
      const battleKey = this.getBattleKey(battleId);
      const rawState = await this.cache.get<BattleEngineState>(battleKey);

      if (!rawState) {
        throw new NotFoundError(`Active battle ${battleId} not found or expired.`);
      }

      if (rawState.outcome !== null) {
        throw new ValidationError(`Battle ${battleId} has already ended with outcome ${rawState.outcome}.`);
      }

      const trainerSave = await prisma.trainerSave.findUnique({
        where: { userId },
        include: { inventory: true },
      });

      if (!trainerSave) {
        throw new NotFoundError('Trainer save not found.');
      }

      // Action Legality Validations
      if (action.type === 'USE_MOVE') {
        const hasMove = rawState.playerActive.moves.some((m) => m.id === action.moveId);
        if (!hasMove) {
          throw new ValidationError(`Move ID ${action.moveId} is not available on active Pokémon.`);
        }
      } else if (action.type === 'SWITCH_POKEMON') {
        const target = rawState.playerParty.find((p) => p.id === action.targetPokemonId);
        if (!target) {
          throw new ValidationError(`Target Pokémon ${action.targetPokemonId} not found in player party.`);
        }
        if (target.currentHp <= 0) {
          throw new ValidationError(`Cannot switch to fainted Pokémon.`);
        }
        if (target.id === rawState.playerActive.id) {
          throw new ValidationError(`Pokémon is already active in battle.`);
        }
      } else if (action.type === 'THROW_BALL') {
        const item = trainerSave.inventory.find(
          (inv) => inv.itemId.toLowerCase() === action.ballType.toLowerCase() && inv.quantity > 0
        );
        if (!item) {
          throw new ValidationError(`You do not have any ${action.ballType} in your inventory.`);
        }

        // Atomically consume one ball from inventory
        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: { quantity: { decrement: 1 } },
        });
      }

      // Load balance configs matching this battle's snapshot version
      const [battleConfig, catchConfig, explorationConfig] = await Promise.all([
        this.balanceService.get('battle', rawState.balanceVersion),
        this.balanceService.get('catch', rawState.balanceVersion),
        this.balanceService.get('exploration', rawState.balanceVersion),
      ]);

      // Execute turn in pure battle engine with snapshot configs
      const turnResult = resolveTurn(rawState, action, {
        battle: battleConfig,
        catch: catchConfig,
      });

      let finalResult = null;
      if (turnResult.state.outcome !== null) {
        finalResult = await this.finalizer.finalize(
          userId,
          turnResult.state,
          turnResult.state.outcome,
          turnResult.events
        );
      }

      // Update state in Redis
      await this.cache.set(
        battleKey,
        turnResult.state,
        explorationConfig.ABANDONED_BATTLE_TTL_SECONDS
      );

      return {
        events: turnResult.events,
        state: this.toPublicBattleState(turnResult.state),
        outcome: turnResult.state.outcome,
        finalResult,
      };
    });
  }

  private toPublicPokemon(p: BattlePokemon, includeMoves: boolean = false) {
    return {
      id: p.id,
      speciesId: p.speciesId,
      speciesName: p.speciesName,
      level: p.level,
      types: p.types,
      maxHp: p.maxHp,
      currentHp: p.currentHp,
      status: p.status,
      moves: includeMoves ? p.moves : undefined,
    };
  }

  public toPublicBattleState(s: BattleEngineState) {
    return {
      battleId: s.battleId,
      turnNumber: s.turnNumber,
      playerActive: this.toPublicPokemon(s.playerActive, true),
      playerParty: s.playerParty.map((p) => this.toPublicPokemon(p, p.id === s.playerActive.id)),
      wildPokemon: this.toPublicPokemon(s.wildPokemon, false),
      outcome: s.outcome,
    };
  }
}
