import { RARE_ENCOUNTER_RATES, RARE_POOLS } from '../config/rareEncounter.config';

export class RareEncounterService {
  rollForRare(): { isRare: boolean; speciesName?: string } {
    const roll = Math.random();
    let cumulativeChance = 0;

    for (const rate of RARE_ENCOUNTER_RATES) {
      cumulativeChance += rate.chance;
      if (roll <= cumulativeChance) {
        const pool = RARE_POOLS[rate.type];
        const speciesName = pool[Math.floor(Math.random() * pool.length)];
        return { isRare: true, speciesName };
      }
    }
    
    return { isRare: false };
  }
}
