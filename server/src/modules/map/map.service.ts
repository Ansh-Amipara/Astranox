import { MapRepository } from './map.repository';
import { NotFoundError } from '../../common/errors/AppError';

export class MapService {
  private repository: MapRepository;

  constructor() {
    this.repository = new MapRepository();
  }

  async getMapData() {
    return this.repository.getHabitatsWithZones();
  }

  async exploreZone(zoneId: number, rngOverride?: number) {
    const zone = await this.repository.getZoneById(zoneId);
    if (!zone) {
      throw new NotFoundError('Zone not found');
    }

    if (zone.encounters.length === 0) {
      return { encounter: null }; // No pokemon here
    }

    // Roll for encounter (e.g. 30% chance to find a pokemon when exploring)
    const exploreRoll = rngOverride ?? Math.random();
    if (exploreRoll > 0.3) {
      return { encounter: null }; // Didn't find anything this time
    }

    // If we found something, determine which species
    const speciesRoll = Math.random();
    let cumulative = 0;
    let selectedEncounter = zone.encounters[zone.encounters.length - 1];

    for (const enc of zone.encounters) {
      cumulative += enc.encounterRate;
      if (speciesRoll <= cumulative) {
        selectedEncounter = enc;
        break;
      }
    }

    // Generate random level within zone limits
    const levelRange = zone.maxLevel - zone.minLevel;
    const randomLevel = zone.minLevel + Math.floor(Math.random() * (levelRange + 1));

    // Generate random IVs
    const ivs = {
      hp: Math.floor(Math.random() * 32),
      attack: Math.floor(Math.random() * 32),
      defense: Math.floor(Math.random() * 32),
      spAtk: Math.floor(Math.random() * 32),
      spDef: Math.floor(Math.random() * 32),
      speed: Math.floor(Math.random() * 32),
    };

    return {
      encounter: {
        species: selectedEncounter.species,
        level: randomLevel,
        ivs
      }
    };
  }
}
