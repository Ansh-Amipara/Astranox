import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';

const prisma = new PrismaClient();

const RANK_REQUIREMENTS: Record<string, any> = {
  'BLACK_IRON': { minLevel: 1, count1: 1 },
  'BRONZE': { minLevel: 31, count1: 2 },
  'SILVER': { minLevel: 61, count1: 3 },
  'GOLD': { minLevel: 91, count1: 3 },
  'PLATINUM': { minLevel: 121, count1: 3 },
  'ADAMANTITE': { minLevel: 151, count1: 3 },
  'DIAMOND': { minLevel: 201, count1: 3 },
  'CRYSTAL': { minLevel: 301, count1: 3 },
  'EPIC': { minLevel: 401, count1: 3 },
  'HEROIC': { minLevel: 501, count1: 3 },
  'SOVEREIGN': { minLevel: 601, count1: 3 },
  'LEGENDARY': { minLevel: 701, count1: 3 },
  'DIVINE': { minLevel: 801, count1: 3 },
  'CELESTIAL': { minLevel: 901, count1: 3 },
  'PRIMORDIAL': { minLevel: 1001, count1: 3 },
  'MYTHICAL': { minLevel: 1201, count1: 3 },
  'INFINITY': { minLevel: 1401, count1: 3 },
  'ETERNAL': { minLevel: 1701, count1: 3 },
};

const RANK_ORDER = [
  'BLACK_IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'ADAMANTITE',
  'DIAMOND',
  'CRYSTAL',
  'EPIC',
  'HEROIC',
  'SOVEREIGN',
  'LEGENDARY',
  'DIVINE',
  'CELESTIAL',
  'PRIMORDIAL',
  'MYTHICAL',
  'INFINITY',
  'ETERNAL'
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
