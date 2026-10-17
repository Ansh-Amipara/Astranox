/**
 * Catch domain balance constants and formulas.
 * Canonical to Gen V+ mechanics as enforced by AGENTS.md.
 */

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
