import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';

const prisma = new PrismaClient();

const RANK_REQUIREMENTS: Record<string, any> = {
  'BLACK_IRON': { minLevel: 5, count1: 1 },
  'BRONZE': { minLevel: 21, count1: 2, minLevelFallback: 41, countFallback: 1 },
  'SILVER': { minLevel: 41, count1: 3, minLevelFallback: 61, countFallback: 1 },
  'GOLD': { minLevel: 61, count1: 3, minLevelFallback: 81, countFallback: 1 },
  'PLATINUM': { minLevel: 81, count1: 3, minLevelFallback: 91, countFallback: 1 },
  'DIAMOND': { minLevel: 91, count1: 3, minLevelFallback: 100, countFallback: 1 },
  'EPIC': { minLevel: 100, count1: 3, requiresLegendary: true },
  'LEGENDARY': { minLevel: 120, count1: 3, requiresLegendary: true },
  'MYTHICAL': { minLevel: 151, count1: 3, requiresLegendary: true },
};

const RANK_ORDER = [
  'BLACK_IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'EPIC',
  'LEGENDARY',
  'MYTHICAL'
];

export class RankService {
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
    if (countAtMinLevel >= req.count1) {
      met = true;
    }

    // Check fallback requirement (e.g. OR 1 Pokemon at Lv 41)
    if (!met && req.minLevelFallback && req.countFallback) {
      const countAtFallbackLevel = allPokemon.filter(p => p.level >= req.minLevelFallback!).length;
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
        pokemonAtFallbackLevel: req.minLevelFallback ? allPokemon.filter(p => p.level >= req.minLevelFallback!).length : 0
      }
    };
  }
}

export const rankService = new RankService();
