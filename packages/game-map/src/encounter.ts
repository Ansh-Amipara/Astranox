import { GameMap } from './types';

export interface RollEncounterResult {
  triggered: boolean;
  encounter?: {
    speciesId: number;
    speciesName: string;
    level: number;
  };
}

export function rollEncounter(
  map: GameMap,
  x: number,
  y: number,
  rng: () => number,
  encounterRate: number = 0.12
): RollEncounterResult {
  // Check bounds
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
    return { triggered: false };
  }

  const row = map.tiles[y];
  if (!row || row[x] !== 'GRASS') {
    return { triggered: false };
  }

  // Roll encounter probability
  const roll = rng();
  if (roll > encounterRate) {
    return { triggered: false };
  }

  // Select encounter table
  const table =
    (map.encounterTables && (map.encounterTables['grass'] || Object.values(map.encounterTables)[0])) ??
    undefined;

  if (!table || table.entries.length === 0) {
    return { triggered: false };
  }

  const totalWeight = table.entries.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight <= 0) {
    return { triggered: false };
  }

  let randomWeight = rng() * totalWeight;
  let selected = table.entries[0];

  for (const entry of table.entries) {
    if (randomWeight < entry.weight) {
      selected = entry;
      break;
    }
    randomWeight -= entry.weight;
  }

  const levelSpan = Math.max(0, selected.maxLevel - selected.minLevel);
  const level = selected.minLevel + Math.floor(rng() * (levelSpan + 1));

  return {
    triggered: true,
    encounter: {
      speciesId: selected.speciesId,
      speciesName: selected.speciesName,
      level,
    },
  };
}
