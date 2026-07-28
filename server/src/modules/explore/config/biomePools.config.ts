import { PLAINS_POKEMON } from './pools/plains.pool';
import { FOREST_POKEMON } from './pools/forest.pool';
import { VOLCANO_POKEMON } from './pools/volcano.pool';
import { OCEAN_POKEMON } from './pools/ocean.pool';
import { FROZEN_PEAKS_POKEMON } from './pools/frozenPeaks.pool';
import { DESERT_POKEMON } from './pools/desert.pool';
import { MOUNTAIN_POKEMON } from './pools/mountain.pool';
import { HAUNTED_RUINS_POKEMON } from './pools/hauntedRuins.pool';
import { FAIRY_GARDEN_POKEMON } from './pools/fairyGarden.pool';
import { SWAMP_POKEMON } from './pools/swamp.pool';
import { ANCIENT_TEMPLE_POKEMON } from './pools/ancientTemple.pool';
import { CRYSTAL_CAVE_POKEMON } from './pools/crystalCave.pool';
import { SKY_ISLANDS_POKEMON } from './pools/skyIslands.pool';
import { ALOLA_POKEMON } from './pools/alola.pool';
import { HISUI_POKEMON } from './pools/hisui.pool';
import { GALAR_POKEMON } from './pools/galar.pool';
import { PALDEA_POKEMON } from './pools/paldea.pool';
import { ExploreLocation } from './coinRewards.config';

export const BIOME_POOLS: Record<ExploreLocation, string[]> = {
  PLAINS: PLAINS_POKEMON,
  FOREST: FOREST_POKEMON,
  VOLCANO: VOLCANO_POKEMON,
  OCEAN: OCEAN_POKEMON,
  FROZEN_PEAKS: FROZEN_PEAKS_POKEMON,
  DESERT: DESERT_POKEMON,
  MOUNTAIN: MOUNTAIN_POKEMON,
  HAUNTED_RUINS: HAUNTED_RUINS_POKEMON,
  FAIRY_GARDEN: FAIRY_GARDEN_POKEMON,
  SWAMP: SWAMP_POKEMON,
  ANCIENT_TEMPLE: ANCIENT_TEMPLE_POKEMON,
  CRYSTAL_CAVE: CRYSTAL_CAVE_POKEMON,
  SKY_ISLANDS: SKY_ISLANDS_POKEMON,
  ALOLA_REGION: ALOLA_POKEMON,
  HISUI_REGION: HISUI_POKEMON,
  GALAR_REGION: GALAR_POKEMON,
  PALDEA_REGION: PALDEA_POKEMON
};
