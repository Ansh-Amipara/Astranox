import { z } from 'zod';

/**
 * Infinity Tower domain balance constants and schema.
 */

export const towerBalanceSchema = z.object({
  MINI_BOSS_INTERVAL: z.number().min(5).max(100).describe('Floor interval for mini-boss battles (e.g. 25)'),
  BOSS_INTERVAL: z.number().min(10).max(200).describe('Floor interval for boss battles (e.g. 50)'),
  MEGA_BOSS_INTERVAL: z.number().min(25).max(500).describe('Floor interval for mega-boss battles (e.g. 100)'),
  BASE_COINS: z.number().min(1).max(1000).describe('Base Infinity Coins added to floor formula'),
  COIN_EXPONENT: z.number().min(0.1).max(2.0).describe('Power exponent for floor coin reward scaling: floor^exponent'),
  XP_PER_MON_LEVEL_MULTIPLIER: z.number().min(1).max(1000).describe('Stored XP multiplier per opponent Pokemon level'),
  MAX_FLOORS: z.number().min(10).max(10000).describe('Absolute maximum floor limit for Infinity Tower'),
  DAILY_FREE_RUNS: z.number().min(1).max(50).describe('Free daily entry resets into the Infinity Tower'),
});

export type TowerBalanceConfig = z.infer<typeof towerBalanceSchema>;

export const TOWER_BALANCE_DEFAULTS: TowerBalanceConfig = {
  MINI_BOSS_INTERVAL: 25,
  BOSS_INTERVAL: 50,
  MEGA_BOSS_INTERVAL: 100,
  BASE_COINS: 10,
  COIN_EXPONENT: 0.65,
  XP_PER_MON_LEVEL_MULTIPLIER: 100,
  MAX_FLOORS: 1000,
  DAILY_FREE_RUNS: 1,
};
