import { ExploreLocation } from './coinRewards.config';

export const EXPLORE_OUTCOME_RATES = {
  POKEMON: 0.75, // 75%
  COINS: 0.15,   // 15%
  NOTHING: 0.10  // 10%
};

export const LOCATION_LEVEL_RANGES: Record<ExploreLocation, { min: number; max: number }> = {
  NORMAL_REGION: { min: 30, max: 50 },
  FIRE_REGION: { min: 30, max: 50 },
  WATER_REGION: { min: 30, max: 50 },
  GRASS_REGION: { min: 30, max: 50 },
  ELECTRIC_REGION: { min: 30, max: 50 },
  ICE_REGION: { min: 30, max: 50 },
  FIGHTING_REGION: { min: 30, max: 50 },
  POISON_REGION: { min: 30, max: 50 },
  GROUND_REGION: { min: 30, max: 50 },
  FLYING_REGION: { min: 30, max: 50 },
  PSYCHIC_REGION: { min: 30, max: 50 },
  BUG_REGION: { min: 30, max: 50 },
  ROCK_REGION: { min: 30, max: 50 },
  GHOST_REGION: { min: 30, max: 50 },
  DRAGON_REGION: { min: 30, max: 50 },
  DARK_REGION: { min: 30, max: 50 },
  STEEL_REGION: { min: 30, max: 50 },
  FAIRY_REGION: { min: 30, max: 50 }
};
