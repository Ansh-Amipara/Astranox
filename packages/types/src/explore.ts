import { z } from 'zod';

export const exploreLocationEnum = z.enum([
  'NORMAL_REGION',
  'FIRE_REGION',
  'WATER_REGION',
  'GRASS_REGION',
  'ELECTRIC_REGION',
  'ICE_REGION',
  'FIGHTING_REGION',
  'POISON_REGION',
  'GROUND_REGION',
  'FLYING_REGION',
  'PSYCHIC_REGION',
  'BUG_REGION',
  'ROCK_REGION',
  'GHOST_REGION',
  'DRAGON_REGION',
  'DARK_REGION',
  'STEEL_REGION',
  'FAIRY_REGION',
], {
  errorMap: () => ({ message: 'Invalid region location provided' }),
});

export const exploreSchema = z.object({
  location: exploreLocationEnum,
});

export type ExploreInput = z.infer<typeof exploreSchema>;
export type ExploreLocationType = z.infer<typeof exploreLocationEnum>;
