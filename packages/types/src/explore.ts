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

export const exploreJoinSchema = z.object({
  mapId: z.string().trim().optional(),
});

export const exploreMoveSchema = z.object({
  direction: z.enum(['UP', 'DOWN', 'LEFT', 'RIGHT']),
  seq: z.number().int().nonnegative(),
});

export type ExploreInput = z.infer<typeof exploreSchema>;
export type ExploreLocationType = z.infer<typeof exploreLocationEnum>;
export type ExploreJoinInput = z.infer<typeof exploreJoinSchema>;
export type ExploreMoveInput = z.infer<typeof exploreMoveSchema>;

export interface PlayerPositionState {
  mapId: string;
  x: number;
  y: number;
  facing: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

export interface ExploreStatePayload {
  mapId: string;
  position: PlayerPositionState;
  activeBattle?: any;
}

export interface ExploreMovedPayload {
  seq: number;
  position: PlayerPositionState;
}

export interface ExploreRejectedPayload {
  seq: number;
  position: PlayerPositionState;
  reason: string;
}
