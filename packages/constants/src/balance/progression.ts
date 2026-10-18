import { z } from 'zod';

/**
 * Progression domain constants: experience, levels, ranks, and potential caps.
 */

export const progressionBalanceSchema = z.object({
  XP_PER_LEVEL: z.number().min(1).max(10000).describe('Experience points required per level up'),
  EXP_YIELD_DIVISOR: z.number().min(1).max(50).describe('Wild exp yield level divisor'),
  ABSOLUTE_MAX_LEVEL: z.number().min(100).max(10000).describe('Maximum level cap for EX tier potential'),
  DEFAULT_INITIAL_LEVEL: z.number().min(1).max(100).describe('Default initial level for generated starter and wild Pokemon'),
  POTENTIAL_MAX_LEVELS: z.record(z.string(), z.number().min(1).max(10000)).describe('Maximum level limit per Pokémon potential tier'),
});

export type ProgressionBalanceConfig = z.infer<typeof progressionBalanceSchema>;

export const PROGRESSION_CONSTANTS = {
  /** Experience points required per level up */
  XP_PER_LEVEL: 100,

  /** Wild exp yield level divisor */
  EXP_YIELD_DIVISOR: 5,

  /** Maximum level cap for EX tier potential */
  ABSOLUTE_MAX_LEVEL: 5000,

  /** Default initial level for generated starter and wild Pokemon */
  DEFAULT_INITIAL_LEVEL: 5,
} as const;

/**
 * Ordered trainer rank tiers from lowest to highest.
 */
export const RANK_ORDER = [
  'F',
  'E',
  'D',
  'C',
  'B',
  'A',
  'S_MINUS',
  'S',
  'S_PLUS',
  'SS_MINUS',
  'SS',
  'SS_PLUS',
  'SSS_MINUS',
  'SSS',
  'SSS_PLUS',
  'EX',
] as const;

export type RankTier = (typeof RANK_ORDER)[number];

/**
 * Requirements to unlock and advance through each trainer rank.
 */
export const RANK_REQUIREMENTS: Record<
  RankTier,
  { minLevel: number; count1: number; minLevelFallback?: number; countFallback?: number; requiresLegendary?: boolean }
> = {
  F: { minLevel: 1, count1: 1 },
  E: { minLevel: 26, count1: 2 },
  D: { minLevel: 51, count1: 2 },
  C: { minLevel: 76, count1: 3 },
  B: { minLevel: 101, count1: 3 },
  A: { minLevel: 151, count1: 3 },
  S_MINUS: { minLevel: 201, count1: 4 },
  S: { minLevel: 301, count1: 4 },
  S_PLUS: { minLevel: 351, count1: 4 },
  SS_MINUS: { minLevel: 401, count1: 5 },
  SS: { minLevel: 501, count1: 5 },
  SS_PLUS: { minLevel: 601, count1: 5 },
  SSS_MINUS: { minLevel: 701, count1: 6 },
  SSS: { minLevel: 801, count1: 6 },
  SSS_PLUS: { minLevel: 901, count1: 6 },
  EX: { minLevel: 1001, count1: 6 },
} as const;

/**
 * Maximum level limit per Pokémon potential tier.
 */
export const POTENTIAL_MAX_LEVELS = {
  F: 25,
  E: 50,
  D: 75,
  C: 100,
  B: 150,
  A: 200,
  S_MINUS: 300,
  S: 350,
  S_PLUS: 400,
  SS_MINUS: 500,
  SS: 600,
  SS_PLUS: 700,
  SSS_MINUS: 800,
  SSS: 900,
  SSS_PLUS: 1000,
  EX: 5000,
} as const;

export type PotentialTier = keyof typeof POTENTIAL_MAX_LEVELS;

/**
 * Calculates the minimum XP required to reach a specific level.
 * Level 1 = 0 XP, Level 2 = 101 XP, Level 3 = 201 XP...
 * Formula: (L - 1) * XP_PER_LEVEL + 1 (for L > 1), 0 (for L <= 1).
 */
export function getXpForLevel(level: number, config?: ProgressionBalanceConfig): number {
  if (level <= 1) return 0;
  const xpPerLevel = config?.XP_PER_LEVEL ?? PROGRESSION_CONSTANTS.XP_PER_LEVEL;
  return (level - 1) * xpPerLevel + 1;
}

/**
 * Calculates the current level based on total XP.
 * 0-100 XP => Level 1, 101-200 XP => Level 2, 201-300 XP => Level 3...
 */
export function getLevelFromXp(xp: number, config?: ProgressionBalanceConfig): number {
  if (xp <= 0) return 1;
  const xpPerLevel = config?.XP_PER_LEVEL ?? PROGRESSION_CONSTANTS.XP_PER_LEVEL;
  return Math.floor((xp - 1) / xpPerLevel) + 1;
}

/**
 * Calculates the XP yield from defeating an opponent.
 * Formula: floor(baseExp * level / EXP_YIELD_DIVISOR)
 */
export function getExpYield(baseExp: number, level: number, config?: ProgressionBalanceConfig): number {
  const divisor = config?.EXP_YIELD_DIVISOR ?? PROGRESSION_CONSTANTS.EXP_YIELD_DIVISOR;
  return Math.floor((baseExp * level) / divisor);
}

/**
 * Resolves the maximum level cap for a given potential tier.
 */
export function getMaxLevelForPotential(potential: string, config?: ProgressionBalanceConfig): number {
  const tier = potential as PotentialTier;
  const potentialMap = config?.POTENTIAL_MAX_LEVELS ?? POTENTIAL_MAX_LEVELS;
  const absoluteMax = config?.ABSOLUTE_MAX_LEVEL ?? PROGRESSION_CONSTANTS.ABSOLUTE_MAX_LEVEL;
  return (potentialMap as Record<string, number>)[tier] ?? absoluteMax;
}
