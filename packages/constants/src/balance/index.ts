import { z } from 'zod';
import { BATTLE_CONSTANTS, battleBalanceSchema } from './battle';
import { CATCH_CONSTANTS, catchBalanceSchema } from './catch';
import { REALM_CONSTANTS, realmBalanceSchema, EXPLORATION_CONSTANTS, explorationBalanceSchema } from './realm';
import { PROGRESSION_CONSTANTS, POTENTIAL_MAX_LEVELS, progressionBalanceSchema } from './progression';
import { ECONOMY_CONSTANTS, economyBalanceSchema } from './economy';
import { LIMIT_CONSTANTS, limitsBalanceSchema } from './limits';
import { ARENA_BALANCE_DEFAULTS, arenaBalanceSchema } from './arena';
import { RANK_BALANCE_DEFAULTS, rankBalanceSchema } from './rank';
import { TOWER_BALANCE_DEFAULTS, towerBalanceSchema } from './tower';
import { RIFT_BALANCE_DEFAULTS, riftBalanceSchema } from './rift';

export * from './battle';
export * from './catch';
export * from './realm';
export * from './progression';
export * from './economy';
export * from './limits';
export * from './data-version';
export * from './arena';
export * from './rank';
export * from './tower';
export * from './rift';

export const BALANCE_SECTIONS = [
  'battle',
  'catch',
  'exploration',
  'progression',
  'economy',
  'limits',
  'arena',
  'rank',
  'tower',
  'rift',
] as const;

export type BalanceSection = (typeof BALANCE_SECTIONS)[number];

export const BALANCE_SCHEMAS: Record<BalanceSection, z.ZodTypeAny> = {
  battle: battleBalanceSchema,
  catch: catchBalanceSchema,
  exploration: explorationBalanceSchema,
  progression: progressionBalanceSchema,
  economy: economyBalanceSchema,
  limits: limitsBalanceSchema,
  arena: arenaBalanceSchema,
  rank: rankBalanceSchema,
  tower: towerBalanceSchema,
  rift: riftBalanceSchema,
};

export const PROGRESSION_BALANCE_DEFAULTS = {
  XP_PER_LEVEL: PROGRESSION_CONSTANTS.XP_PER_LEVEL,
  EXP_YIELD_DIVISOR: PROGRESSION_CONSTANTS.EXP_YIELD_DIVISOR,
  ABSOLUTE_MAX_LEVEL: PROGRESSION_CONSTANTS.ABSOLUTE_MAX_LEVEL,
  DEFAULT_INITIAL_LEVEL: PROGRESSION_CONSTANTS.DEFAULT_INITIAL_LEVEL,
  POTENTIAL_MAX_LEVELS: { ...POTENTIAL_MAX_LEVELS },
};

export const BALANCE_DEFAULTS: Record<BalanceSection, any> = {
  battle: BATTLE_CONSTANTS,
  catch: CATCH_CONSTANTS,
  exploration: EXPLORATION_CONSTANTS,
  progression: PROGRESSION_BALANCE_DEFAULTS,
  economy: ECONOMY_CONSTANTS,
  limits: LIMIT_CONSTANTS,
  arena: ARENA_BALANCE_DEFAULTS,
  rank: RANK_BALANCE_DEFAULTS,
  tower: TOWER_BALANCE_DEFAULTS,
  rift: RIFT_BALANCE_DEFAULTS,
};

/** Sections accessible by regular players via /config/balance */
export const PUBLIC_BALANCE_SECTIONS: BalanceSection[] = [
  'progression',
  'exploration',
  'economy',
  'limits',
  'arena',
  'rank',
  'tower',
  'rift',
];
