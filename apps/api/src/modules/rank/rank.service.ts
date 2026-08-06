import { injectable } from 'tsyringe';
import { AppError } from '../../core/errors/AppError';
import { prisma } from '../../core/db/prisma';
import { BattleSessionService } from '../battles/services/battle-session.service';

import { getMinPotentialForLevel, getMaxLevelForPotential } from '../../game/instance/PokemonInstance';

export const RANK_ORDER = [
  'F_MINUS', 'F', 'F_PLUS', 
  'E_MINUS', 'E', 'E_PLUS', 
  'D_MINUS', 'D', 'D_PLUS',
  'C_MINUS', 'C', 'C_PLUS',
  'B_MINUS', 'B', 'B_PLUS',
  'A_MINUS', 'A', 'A_PLUS',
  'S_MINUS', 'S', 'S_PLUS',
  'SS_MINUS', 'SS', 'SS_PLUS',
  'SSS_MINUS', 'SSS', 'SSS_PLUS',
  'EX_MINUS', 'EX', 'EX_PLUS'
];

const RANK_REQUIREMENTS: Record<string, any> = {};
for (let i = 1; i < RANK_ORDER.length; i++) {
  const currentRank = RANK_ORDER[i];
  const previousRank = RANK_ORDER[i - 1];
  
  // You need 3 pokemon at the new rank's min level (which is previous max + 1)
  const minLevel = getMaxLevelForPotential(previousRank) + 1;
  
  let minLevelFallback = undefined;
  if (i < RANK_ORDER.length - 1) {
    // Fallback is 1 pokemon at the next rank's min level
    minLevelFallback = getMaxLevelForPotential(currentRank) + 1;
  }
  
  RANK_REQUIREMENTS[currentRank] = {
    minLevel,
    count1: 3,
    minLevelFallback,
    countFallback: 1
  };
}

@injectable()
export class RankService {
  constructor(private battleSessionService: BattleSessionService) {}

  async getRankStatus(userId: string) {
    const trainer = await prisma.trainerSave.findUnique({
      where: { userId },
      include: {
        party: { include: { species: { include: { type1: true, type2: true } } } },
        inventory: true
      }
    });

    if (!trainer) throw new AppError('Trainer not found', 404);

    // Get all pokemon (party + PC) to check levels
    const allPokemon = await prisma.ownedPokemon.findMany({
      where: { trainerId: trainer.id },
      include: { species: true }
    });

    const currentRankIndex = RANK_ORDER.indexOf((trainer as any).rank);
    const nextRank = currentRankIndex < RANK_ORDER.length - 1 ? RANK_ORDER[currentRankIndex + 1] : null;

    if (!nextRank) {
      return {
        currentRank: (trainer as any).rank,
        nextRank: null,
        requirementMet: false,
        message: 'You have reached the highest rank!'
      };
    }

    const req = RANK_REQUIREMENTS[nextRank];
    let met = false;
    
    // Check primary requirement
    const countAtMinLevel = allPokemon.filter(p => p.level >= req.minLevel).length;
    const countAtFallbackLevel = req.minLevelFallback
      ? allPokemon.filter(p => p.level >= req.minLevelFallback!).length
      : 0;

    if (countAtMinLevel >= req.count1) {
      met = true;
    }

    // Check fallback requirement (e.g. OR 1 Pokemon at Lv 41)
    if (!met && req.minLevelFallback && req.countFallback) {
      if (countAtFallbackLevel >= req.countFallback) {
        met = true;
      }
    }

    // Check legendary requirement
    if (met && req.requiresLegendary) {
      // Basic legendary check (catch rate <= 3 is often a sign of legendaries)
      const hasLegendary = allPokemon.some(p => p.species.catchRate <= 3);
      if (!hasLegendary) met = false;
    }

    return {
      currentRank: (trainer as any).rank,
      nextRank,
      requirementMet: met,
      requirements: req,
      progress: {
        pokemonAtPrimaryLevel: countAtMinLevel,
        pokemonAtFallbackLevel: countAtFallbackLevel,
        currentCount: countAtMinLevel,
        requiredCount: req.count1,
        minLevel: req.minLevel
      }
    };
  }

  async promoteRank(userId: string) {
    const status = await this.getRankStatus(userId);
    if (!status.requirementMet || !status.nextRank) {
      throw new AppError('You do not meet the requirements for this rank promotion.', 400);
    }

    const sessionData = await this.battleSessionService.startRankExamEncounter(userId, status.nextRank);

    return {
      battleSession: sessionData,
      targetRank: status.nextRank
    };
  }
}
