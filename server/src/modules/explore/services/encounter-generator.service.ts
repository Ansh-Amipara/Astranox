import { ExploreLocation } from '../config/coinRewards.config';
import { BIOME_POOLS } from '../config/biomePools.config';
import { LOCATION_LEVEL_RANGES } from '../config/explore.config';
import { RareEncounterService } from './rare-encounter.service';

export class EncounterGeneratorService {
  private rareService = new RareEncounterService();

  generateEncounter(location: ExploreLocation): { speciesName: string, level: number } {
    // 1. Roll rare encounter
    const rareResult = this.rareService.rollForRare();
    
    let speciesName = rareResult.speciesName;
    
    if (!speciesName) {
      // 2. Fallback to biome pool
      const pool = BIOME_POOLS[location];
      speciesName = pool[Math.floor(Math.random() * pool.length)];
    }

    // 3. Roll level
    const range = LOCATION_LEVEL_RANGES[location];
    const level = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    return { speciesName, level };
  }
}
