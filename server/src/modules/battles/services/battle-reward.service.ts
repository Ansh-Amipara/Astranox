import { Prisma, BattleStatus } from '@prisma/client';

export class BattleRewardService {
  async processFaintRewards(result: any, wildPokemon: any, tx: Prisma.TransactionClient): Promise<{ newStatus?: BattleStatus }> {
    const { getExpYield, getLevelFromXp } = require('../../../game/battle/level-math');
    let newStatus: BattleStatus | undefined = undefined;

    const xpYield = getExpYield(wildPokemon.baseExp, wildPokemon.level);
    
    result.p1State.currentXp += xpYield;
    result.events.push({ type: 'xp_gain', pokemonId: result.p1State.id, amount: xpYield });

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
      const updateData: any = { money: { increment: npcTrainer.rewardMoney } };
      if (npcTrainer.badgeName && !hasBadge) {
        updateData.badges = { push: npcTrainer.badgeName };
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
    }
  }
}
