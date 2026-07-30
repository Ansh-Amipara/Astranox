import { injectable } from 'tsyringe';
import { AppError } from '../../core/errors/AppError';
import { prisma } from '../../core/db/prisma';
import { BattleSessionService } from '../battles/services/battle-session.service';

const RANK_REQUIREMENTS: Record<string, any> = {
  'F_RANK': { minLevel: 1, count1: 1 },
  'E_RANK': { minLevel: 61, count1: 3, minLevelFallback: 121, countFallback: 1 },
  'D_RANK': { minLevel: 121, count1: 3, minLevelFallback: 201, countFallback: 1 },
  'C_RANK': { minLevel: 201, count1: 3, minLevelFallback: 301, countFallback: 1 },
  'B_RANK': { minLevel: 301, count1: 3, minLevelFallback: 401, countFallback: 1 },
  'A_RANK': { minLevel: 401, count1: 3, minLevelFallback: 501, countFallback: 1 },
  'S_MINUS_RANK': { minLevel: 501, count1: 3, minLevelFallback: 701, countFallback: 1 },
  'S_RANK': { minLevel: 701, count1: 3, minLevelFallback: 901, countFallback: 1 },
  'S_PLUS_RANK': { minLevel: 901, count1: 3, minLevelFallback: 1101, countFallback: 1 },
  'SS_MINUS_RANK': { minLevel: 1101, count1: 3, minLevelFallback: 1401, countFallback: 1 },
  'SS_RANK': { minLevel: 1401, count1: 3, minLevelFallback: 1701, countFallback: 1 },
  'SS_PLUS_RANK': { minLevel: 1701, count1: 3, minLevelFallback: 2001, countFallback: 1 },
  'SSS_MINUS_RANK': { minLevel: 2001, count1: 3, minLevelFallback: 3001, countFallback: 1 },
  'SSS_RANK': { minLevel: 3001, count1: 3, minLevelFallback: 4001, countFallback: 1 },
  'SSS_PLUS_RANK': { minLevel: 4001, count1: 3 },
};

const RANK_ORDER = [
  'NO_RANK',
  'F_RANK',
  'E_RANK',
  'D_RANK',
  'C_RANK',
  'B_RANK',
  'A_RANK',
  'S_MINUS_RANK',
  'S_RANK',
  'S_PLUS_RANK',
  'SS_MINUS_RANK',
  'SS_RANK',
  'SS_PLUS_RANK',
  'SSS_MINUS_RANK',
  'SSS_RANK',
  'SSS_PLUS_RANK'
];

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
