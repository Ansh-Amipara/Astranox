import { injectable } from 'tsyringe';
import { ExploreLocation } from '../config/coinRewards.config';
import { LOCATION_LEVEL_RANGES } from '../config/explore.config';
import { RareEncounterService } from './rare-encounter.service';
import { prisma } from '../../../core/db/prisma';
import { CacheService } from '../../../core/services/cache.service';

@injectable()
export class EncounterGeneratorService {
  constructor(
    private rareService: RareEncounterService,
    private cache: CacheService
  ) {}

  private async getSpeciesForType(type: string): Promise<string[]> {
    const cacheKey = `explore:pools:${type}`;
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
        select: { name: true }
      });
      return speciesList.map(s => s.name);
    });
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
      speciesName = pool[Math.floor(Math.random() * pool.length)];
    }

    // 3. Roll level
    const range = LOCATION_LEVEL_RANGES[location];
    const level = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    return { speciesName, level };
  }

  generateEncounter(location: ExploreLocation): { speciesName: string, level: number } {
    throw new Error('generateEncounter must be called asynchronously now. Use generateEncounterAsync.');
  }
}
