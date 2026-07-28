import { ExploreLocation } from './coinRewards.config';

export const EXPLORE_OUTCOME_RATES = {
  POKEMON: 0.75, // 75%
  COINS: 0.15,   // 15%
  NOTHING: 0.10  // 10%
};

export const LOCATION_LEVEL_RANGES: Record<ExploreLocation, { min: number; max: number }> = {
  PLAINS: { min: 2, max: 10 },
  FOREST: { min: 5, max: 15 },
  MOUNTAIN: { min: 10, max: 25 },
  OCEAN: { min: 15, max: 30 },
  SWAMP: { min: 15, max: 30 },
  DESERT: { min: 20, max: 40 },
  FAIRY_GARDEN: { min: 20, max: 35 },
  FROZEN_PEAKS: { min: 25, max: 45 },
  VOLCANO: { min: 30, max: 50 },
  HAUNTED_RUINS: { min: 30, max: 45 },
  CRYSTAL_CAVE: { min: 35, max: 55 },
  ANCIENT_TEMPLE: { min: 40, max: 60 },
  SKY_ISLANDS: { min: 45, max: 70 },
  ALOLA_REGION: { min: 20, max: 40 },
  HISUI_REGION: { min: 20, max: 40 },
  GALAR_REGION: { min: 20, max: 40 },
  PALDEA_REGION: { min: 20, max: 40 }
};
