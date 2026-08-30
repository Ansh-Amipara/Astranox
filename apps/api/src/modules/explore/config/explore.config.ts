import { ExploreLocation } from './coinRewards.config';

export const EXPLORE_OUTCOME_RATES = {
  POKEMON: 0.75, // 75%
  COINS: 0.15,   // 15%
  NOTHING: 0.10  // 10%
};

// Cumulative weights for rank probabilities
// Order is from lowest rank (most common) to highest (rarest) to allow for fallback logic if needed
export const RANK_ENCOUNTER_PROBABILITIES: Record<string, number> = {
  'F': 40.0,
  'E': 25.0,
  'D': 15.0,
  'C': 10.0,
  'B': 5.0,
  'A': 3.0,
  'S': 1.0,
  'SS': 0.6,
  'SSS': 0.3,
  'EX': 0.1
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
