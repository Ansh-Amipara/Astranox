import { injectable } from 'tsyringe';
import { ExploreLocation } from '../config/coinRewards.config';
import { RANK_ENCOUNTER_PROBABILITIES, LOCATION_LEVEL_RANGES } from '../config/explore.config';
import { RareEncounterService } from './rare-encounter.service';
import { prisma } from '../../../core/db/prisma';
import { CacheService } from '../../../core/services/cache.service';

@injectable()
export class EncounterGeneratorService {
  constructor(
    private rareService: RareEncounterService,
    private cache: CacheService
  ) {}

  private async getSpeciesForType(type: string): Promise<{name: string, rank: string}[]> {
    const cacheKey = `explore:pools:v2:${type}`;
    return this.cache.getOrSet(cacheKey, async () => {
      const speciesList = await prisma.species.findMany({
        where: {
          OR: [
            { type1: { name: type } },
            { type2: { name: type } }
          ],
          NOT: [
            { name: { startsWith: 'mega ' } },
            { name: { startsWith: 'gmax ' } }
          ]
        },
        select: { name: true, rank: true }
      });
      return speciesList.map(s => ({ name: s.name, rank: s.rank || 'F' }));
    });
  }

  private rollForRank(): string {
    // Reverse order (highest to lowest) doesn't strictly matter for roulette selection, 
    // but we can use an explicit array to ensure consistent keys.
    const ranks = ['EX', 'SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const totalWeight = Object.values(RANK_ENCOUNTER_PROBABILITIES).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const rank of ranks) {
      const weight = RANK_ENCOUNTER_PROBABILITIES[rank] || 0;
      if (random < weight) {
        return rank;
      }
      random -= weight;
    }
    return 'F';
  }

  private fallbackRank(rank: string): string {
    const ranks = ['EX', 'SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const index = ranks.indexOf(rank);
    if (index === -1 || index === ranks.length - 1) return 'F';
    return ranks[index + 1];
  }

  async generateEncounterAsync(location: ExploreLocation): Promise<{ speciesName: string, level: number }> {
    // 1. Roll rare encounter
    const rareResult = this.rareService.rollForRare();
    
    let speciesName = rareResult.speciesName;
    
    if (!speciesName) {
      // 2. Fetch biome pool from DB
      const typeStr = location.split('_')[0].toLowerCase();
      const pool = await this.getSpeciesForType(typeStr);
      if (pool.length === 0) {
        throw new Error(`No species found for region type ${typeStr}`);
      }

      let targetRank = this.rollForRank();
      let rankPool = pool.filter(s => s.rank === targetRank);
      
      while (rankPool.length === 0 && targetRank !== 'F') {
        targetRank = this.fallbackRank(targetRank);
        rankPool = pool.filter(s => s.rank === targetRank);
      }
      
      if (rankPool.length === 0) {
        // Ultimate fallback: just pick any from the pool if even F rank is empty
        rankPool = pool;
      }

      speciesName = rankPool[Math.floor(Math.random() * rankPool.length)].name;
    }

    // 3. Roll level
    const range = LOCATION_LEVEL_RANGES[location];
    const level = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    return { speciesName, level };
  }

  generateEncounter(_location: ExploreLocation): { speciesName: string, level: number } {
    throw new Error('generateEncounter must be called asynchronously now. Use generateEncounterAsync.');
  }
}
