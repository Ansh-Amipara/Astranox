export type ExploreLocation = 
  | 'NORMAL_REGION'
  | 'FIRE_REGION'
  | 'WATER_REGION'
  | 'GRASS_REGION'
  | 'ELECTRIC_REGION'
  | 'ICE_REGION'
  | 'FIGHTING_REGION'
  | 'POISON_REGION'
  | 'GROUND_REGION'
  | 'FLYING_REGION'
  | 'PSYCHIC_REGION'
  | 'BUG_REGION'
  | 'ROCK_REGION'
  | 'GHOST_REGION'
  | 'DRAGON_REGION'
  | 'DARK_REGION'
  | 'STEEL_REGION'
  | 'FAIRY_REGION';

export const COIN_REWARDS: Record<ExploreLocation, { min: number; max: number }> = {
  NORMAL_REGION: { min: 500, max: 1500 },
  FIRE_REGION: { min: 500, max: 1500 },
  WATER_REGION: { min: 500, max: 1500 },
  GRASS_REGION: { min: 500, max: 1500 },
  ELECTRIC_REGION: { min: 500, max: 1500 },
  ICE_REGION: { min: 500, max: 1500 },
  FIGHTING_REGION: { min: 500, max: 1500 },
  POISON_REGION: { min: 500, max: 1500 },
  GROUND_REGION: { min: 500, max: 1500 },
  FLYING_REGION: { min: 500, max: 1500 },
  PSYCHIC_REGION: { min: 500, max: 1500 },
  BUG_REGION: { min: 500, max: 1500 },
  ROCK_REGION: { min: 500, max: 1500 },
  GHOST_REGION: { min: 500, max: 1500 },
  DRAGON_REGION: { min: 500, max: 1500 },
  DARK_REGION: { min: 500, max: 1500 },
  STEEL_REGION: { min: 500, max: 1500 },
  FAIRY_REGION: { min: 500, max: 1500 }
};
