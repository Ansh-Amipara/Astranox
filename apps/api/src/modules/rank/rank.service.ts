import { injectable } from 'tsyringe';
import { AppError } from '../../core/errors/AppError';
import { prisma } from '../../core/db/prisma';
import { BattleSessionService } from '../battles/services/battle-session.service';

import { getMinPotentialForLevel, getMaxLevelForPotential } from '../../game/instance/PokemonInstance';

export const RANK_ORDER = [
  'F', 'E', 'D', 'C', 'B', 'A',
  'S_MINUS', 'S', 'S_PLUS',
  'SS_MINUS', 'SS', 'SS_PLUS',
  'SSS_MINUS', 'SSS', 'SSS_PLUS',
  'EX'
];

const RANK_REQUIREMENTS: Record<string, { minLevel: number; count1: number; minLevelFallback?: number; countFallback?: number; requiresLegendary?: boolean }> = {
  F: { minLevel: 1, count1: 1 },
  E: { minLevel: 26, count1: 2 },
  D: { minLevel: 51, count1: 2 },
  C: { minLevel: 76, count1: 3 },
  B: { minLevel: 101, count1: 3 },
  A: { minLevel: 151, count1: 3 },
  S_MINUS: { minLevel: 201, count1: 4 },
  S: { minLevel: 301, count1: 4 },
  S_PLUS: { minLevel: 351, count1: 4 },
  SS_MINUS: { minLevel: 401, count1: 5 },
  SS: { minLevel: 501, count1: 5 },
  SS_PLUS: { minLevel: 601, count1: 5 },
  SSS_MINUS: { minLevel: 701, count1: 6 },
  SSS: { minLevel: 801, count1: 6 },
  SSS_PLUS: { minLevel: 901, count1: 6 },
  EX: { minLevel: 1001, count1: 6 },
};

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
