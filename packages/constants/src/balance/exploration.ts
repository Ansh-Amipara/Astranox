/**
 * Exploration and overworld domain balance constants.
 * Enforced across server-authoritative exploration loop and client UI.
 */

export const EXPLORATION_CONSTANTS = {
  /** Chance of triggering a wild encounter when stepping on a GRASS tile */
  ENCOUNTER_CHANCE_GRASS: 0.12,

  /** Steps of encounter immunity awarded to the player immediately after a battle */
  POST_BATTLE_IMMUNITY_STEPS: 5,

  /** Minimum milliseconds between authoritative player movements */
  MOVE_COOLDOWN_MS: 180,

  /** Max movements allowed per second before throttling/rejection */
  MAX_MOVES_PER_SECOND: 6,

  /** Default spawn point map ID */
  DEFAULT_SPAWN_MAP_ID: 'pallet-town',

  /** Default spawn X tile coordinate */
  DEFAULT_SPAWN_X: 5,

  /** Default spawn Y tile coordinate */
  DEFAULT_SPAWN_Y: 5,

  /** Default spawn direction facing */
  DEFAULT_SPAWN_FACING: 'DOWN' as const,

  /** Currency awarded on winning a wild battle: species level * multiplier */
  WIN_CURRENCY_MULTIPLIER: 10,

  /** Astral coins awarded directly on a successful capture */
  CAPTURE_CURRENCY_REWARD: 25,

  /** XP multiplier granted on capture relative to victory XP */
  CAPTURE_XP_RATIO: 1.0,

  /** Ratio of Astral Coins deducted when player's party faints (DEFEATED) */
  DEFEAT_CURRENCY_PENALTY_RATIO: 0.10,

  /** Maximum cap of Astral Coins lost upon DEFEATED */
  DEFEAT_CURRENCY_PENALTY_CAP: 1000,

  /** Abandoned battle TTL in seconds (15 minutes) before expiration */
  ABANDONED_BATTLE_TTL_SECONDS: 900,

  /** Viewport tile grid dimensions (horizontal x vertical) */
  VIEWPORT_WIDTH_TILES: 11,
  VIEWPORT_HEIGHT_TILES: 9,
} as const;

export type ExplorationDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
