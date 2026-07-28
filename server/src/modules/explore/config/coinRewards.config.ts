export type ExploreLocation = 
  | 'PLAINS'
  | 'FOREST'
  | 'VOLCANO'
  | 'OCEAN'
  | 'FROZEN_PEAKS'
  | 'DESERT'
  | 'MOUNTAIN'
  | 'HAUNTED_RUINS'
  | 'FAIRY_GARDEN'
  | 'SWAMP'
  | 'ANCIENT_TEMPLE'
  | 'CRYSTAL_CAVE'
  | 'SKY_ISLANDS'
  | 'ALOLA_REGION'
  | 'HISUI_REGION'
  | 'GALAR_REGION'
  | 'PALDEA_REGION';

export const COIN_REWARDS: Record<ExploreLocation, { min: number; max: number }> = {
  PLAINS: { min: 100, max: 300 },
  FOREST: { min: 250, max: 600 },
  VOLCANO: { min: 1200, max: 2500 },
  OCEAN: { min: 500, max: 1000 },
  FROZEN_PEAKS: { min: 800, max: 1500 },
  DESERT: { min: 400, max: 900 },
  MOUNTAIN: { min: 600, max: 1200 },
  HAUNTED_RUINS: { min: 1000, max: 2000 },
  FAIRY_GARDEN: { min: 1500, max: 3000 },
  SWAMP: { min: 300, max: 800 },
  ANCIENT_TEMPLE: { min: 2000, max: 4000 },
  CRYSTAL_CAVE: { min: 2500, max: 5000 },
  SKY_ISLANDS: { min: 3000, max: 8000 },
  ALOLA_REGION: { min: 1000, max: 2000 },
  HISUI_REGION: { min: 1500, max: 3000 },
  GALAR_REGION: { min: 1200, max: 2500 },
  PALDEA_REGION: { min: 1500, max: 3000 }
};
