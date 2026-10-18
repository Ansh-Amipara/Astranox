import { z } from 'zod';

/**
 * Catch domain balance constants and formulas.
 * Canonical to Gen V+ mechanics as enforced by AGENTS.md.
 */

export const catchBalanceSchema = z.object({
  BALL_BONUS: z.object({
    'poke-ball': z.number().min(0.1).max(255).describe('Poke Ball catch multiplier'),
    'great-ball': z.number().min(0.1).max(255).describe('Great Ball catch multiplier'),
    'ultra-ball': z.number().min(0.1).max(255).describe('Ultra Ball catch multiplier'),
    'luxury-ball': z.number().min(0.1).max(255).describe('Luxury Ball catch multiplier'),
    'master-ball': z.number().min(0.1).max(255).describe('Master Ball catch multiplier'),
  }),
  STATUS_BONUS: z.object({
    sleep: z.number().min(1.0).max(10.0).describe('Sleep status multiplier'),
    freeze: z.number().min(1.0).max(10.0).describe('Freeze status multiplier'),
    paralysis: z.number().min(1.0).max(10.0).describe('Paralysis status multiplier'),
    poison: z.number().min(1.0).max(10.0).describe('Poison status multiplier'),
    burn: z.number().min(1.0).max(10.0).describe('Burn status multiplier'),
    none: z.number().min(1.0).max(10.0).describe('No status multiplier'),
  }),
  MAX_CATCH_RATE: z.number().min(1).max(255).describe('Maximum species catch rate byte value'),
  REQUIRED_SHAKES: z.number().min(1).max(10).describe('Total shake iterations required for capture'),
  MAX_DISPLAY_SHAKES: z.number().min(1).max(10).describe('Maximum displayed shake animations'),
  THRESHOLD_DIVIDEND: z.number().min(1000).max(10000000).describe('Gen V+ shake probability threshold dividend'),
  THRESHOLD_NUMERATOR: z.number().min(1000).max(50000000).describe('Gen V+ shake probability threshold numerator constant'),
  MASTER_BALL_THRESHOLD: z.number().min(1).max(255).describe('Master ball bypass threshold'),
});

export type CatchBalanceConfig = z.infer<typeof catchBalanceSchema>;

export const CATCH_CONSTANTS = {
  /** Ball multiplier bonuses */
  BALL_BONUS: {
    'poke-ball': 1.0,
    'great-ball': 1.5,
    'ultra-ball': 2.0,
    'luxury-ball': 1.0,
    'master-ball': 255.0,
  } as const,

  /** Status ailment catch rate multipliers */
  STATUS_BONUS: {
    sleep: 2.5,
    freeze: 2.5,
    paralysis: 1.5,
    poison: 1.5,
    burn: 1.5,
    none: 1.0,
  } as const,

  /** Maximum species catch rate byte value */
  MAX_CATCH_RATE: 255,

  /** Total shake iterations required for capture (4 wobbles = caught) */
  REQUIRED_SHAKES: 4,

  /** Maximum displayed shake animations */
  MAX_DISPLAY_SHAKES: 3,

  /** Gen V+ shake probability threshold dividend */
  THRESHOLD_DIVIDEND: 1048560,

  /** Gen V+ shake probability threshold numerator constant */
  THRESHOLD_NUMERATOR: 16711680,

  /** Master ball bypass threshold */
  MASTER_BALL_THRESHOLD: 255,
} as const;

export type CatchBallType = keyof typeof CATCH_CONSTANTS.BALL_BONUS;
export type CatchStatusType = keyof typeof CATCH_CONSTANTS.STATUS_BONUS;

/**
 * Resolves ball bonus multiplier from an item name string.
 */
export function getBallBonusMultiplier(itemName: string): number {
  const normalized = itemName.toLowerCase() as CatchBallType;
  return CATCH_CONSTANTS.BALL_BONUS[normalized] ?? 1.0;
}

/**
 * Resolves status condition catch multiplier from status condition string.
 */
export function getStatusBonusMultiplier(status: string | null | undefined): number {
  if (!status) return CATCH_CONSTANTS.STATUS_BONUS.none;
  const normalized = status.toLowerCase() as CatchStatusType;
  return CATCH_CONSTANTS.STATUS_BONUS[normalized] ?? CATCH_CONSTANTS.STATUS_BONUS.none;
}
