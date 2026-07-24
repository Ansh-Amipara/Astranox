import { Prisma, BattleStatus } from '@prisma/client';

export class BattleRewardService {
  async processFaintRewards(
    result: any, 
    wildPokemon: any, 
    tx: Prisma.TransactionClient,
    battleType?: string,
    trainerId?: string
  ): Promise<{ newStatus?: BattleStatus }> {
    const { getExpYield, getLevelFromXp, getXpForLevel } = require('../../../game/battle/level-math');
    const { getMaxLevelForPotential } = require('../../../game/instance/PokemonInstance');
    let newStatus: BattleStatus | undefined = undefined;

    let xpYield = getExpYield(wildPokemon.baseExp, wildPokemon.level);
    
    if (battleType === 'NPC' || wildPokemon.isRankExam) {
      xpYield = wildPokemon.examinerXp || xpYield || 500;
    }

    const maxLevel = getMaxLevelForPotential(result.p1State.potential);
    const maxXpForPotential = getXpForLevel(maxLevel + 1) - 1;

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

        if (!(result.p1State as any).pendingMoveLearns) {
          (result.p1State as any).pendingMoveLearns = [];
        }
        
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
          (result.p1State as any).pendingMoveLearns.push({
            moveId: learn.moveId,
            moveName: learn.move.name
          });
        }
      }
    }

    return { newStatus };
  }
}
