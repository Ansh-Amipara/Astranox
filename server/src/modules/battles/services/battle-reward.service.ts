import { Prisma, BattleStatus } from '@prisma/client';

export class BattleRewardService {
  async processFaintRewards(result: any, wildPokemon: any, tx: Prisma.TransactionClient): Promise<{ newStatus?: BattleStatus }> {
    const { getExpYield, getLevelFromXp, getXpForLevel } = require('../../../game/battle/level-math');
    const { getMaxLevelForPotential } = require('../../../game/instance/PokemonInstance');
    let newStatus: BattleStatus | undefined = undefined;

    const maxLevel = getMaxLevelForPotential(result.p1State.potential);
    const maxXpForPotential = getXpForLevel(maxLevel + 1) - 1;

    const xpYield = getExpYield(wildPokemon.baseExp, wildPokemon.level);
    let actualYield = xpYield;

    if (result.p1State.currentXp + xpYield > maxXpForPotential) {
      actualYield = Math.max(0, maxXpForPotential - result.p1State.currentXp);
    }
    
    result.p1State.currentXp += actualYield;
    
    if (actualYield > 0) {
      result.events.push({ type: 'xp_gain', pokemonId: result.p1State.id, amount: actualYield });
    } else {
      result.events.push({ type: 'xp_gain', pokemonId: result.p1State.id, amount: 0 }); // Show 0 if capped
    }

    const oldLevel = result.p1State.level;
    const newLevel = getLevelFromXp(result.p1State.currentXp);

    if (newLevel > oldLevel) {
      result.p1State.level = newLevel;
      result.events.push({ type: 'level_up', pokemonId: result.p1State.id, level: newLevel });

      // Check for new moves
      const newMoves = await tx.learnset.findMany({
        where: {
          speciesId: result.p1State.speciesId,
          level: { gt: oldLevel, lte: newLevel }
        },
        include: { move: true },
        orderBy: { level: 'asc' }
      });

      for (const learn of newMoves) {
        const alreadyKnows = await tx.ownedPokemonMove.findFirst({
          where: { ownedPokemonId: result.p1State.id, moveId: learn.moveId }
        });
        if (alreadyKnows) continue;

        const currentMovesCount = await tx.ownedPokemonMove.count({
          where: { ownedPokemonId: result.p1State.id }
        });

        // Initialize pendingMoveLearns queue if it doesn't exist
        if (!(result.p1State as any).pendingMoveLearns) {
          (result.p1State as any).pendingMoveLearns = [];
        }
        
        // Also account for moves we are about to learn in the queue
        const pendingCount = (result.p1State as any).pendingMoveLearns.length;
        const totalMoves = currentMovesCount + pendingCount;

        if (totalMoves < 4) {
          await tx.ownedPokemonMove.create({
            data: {
              ownedPokemonId: result.p1State.id,
              moveId: learn.moveId,
              slot: totalMoves
            }
          });
          result.events.push({ type: 'learned_move', pokemonId: result.p1State.id, moveName: learn.move.name });
        } else {
          // Add to the queue instead of breaking the battle state immediately
          (result.p1State as any).pendingMoveLearns.push({
            moveId: learn.moveId,
            moveName: learn.move.name
          });
        }
      }
    }

    return { newStatus };
  }

  async processNpcVictory(trainerSave: any, npcTrainerId: string, tx: Prisma.TransactionClient) {
    const npcTrainer = await tx.npcTrainer.findUnique({ where: { id: npcTrainerId } });
    if (npcTrainer) {
      const hasBadge = trainerSave.badges.includes(npcTrainer.badgeName || '');
      const updateData: any = {
        astralCoins: { increment: npcTrainer.rewardAstralCoins },
        infinityCoins: { increment: npcTrainer.rewardInfinityCoins },
        voidCoins: { increment: npcTrainer.rewardVoidCoins }
      };
      
      if (npcTrainer.badgeName && !hasBadge) {
        updateData.badges = { push: npcTrainer.badgeName };
      }

      // Check for Rank Promotion
      if (npcTrainer.trainerClass === 'Examiner') {
        try {
          const { RankService } = require('../../rank/rank.service');
          const rankService = new RankService();
          const status = await rankService.getRankStatus(trainerSave.userId);
          if (status && status.nextRank) {
            updateData.rank = status.nextRank;
          }
        } catch (e) {
          console.error('Failed to promote rank:', e);
        }
      }

      await tx.trainerSave.update({
        where: { id: trainerSave.id },
        data: updateData
      });
      
      await tx.trainerDefeatedNpc.upsert({
         where: { trainerId_npcTrainerId: { trainerId: trainerSave.id, npcTrainerId: npcTrainer.id } },
         create: { trainerId: trainerSave.id, npcTrainerId: npcTrainer.id },
         update: {}
      });

      return {
        astralCoinsGained: npcTrainer.rewardAstralCoins,
        infinityCoinsGained: npcTrainer.rewardInfinityCoins,
        voidCoinsGained: npcTrainer.rewardVoidCoins
      };
    }
    return { astralCoinsGained: 0, infinityCoinsGained: 0, voidCoinsGained: 0 };
  }
}
