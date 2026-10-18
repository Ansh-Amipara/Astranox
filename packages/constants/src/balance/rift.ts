import { z } from 'zod';

/**
 * Void Rift domain balance constants and schema.
 */

export const riftBalanceSchema = z.object({
  BASE_FLOOR_COUNT: z.number().min(1).max(20).describe('Default base floor count for void rift runs'),
  MAX_DAILY_RUNS: z.number().min(1).max(50).describe('Maximum allowed rift runs per day'),
  ABANDON_COOLDOWN_SECONDS: z.number().min(0).max(3600).describe('Cooldown before restarting a run after abandoning'),
  NORMAL_STAT_MULT: z.number().min(1.0).max(5.0).describe('Normal difficulty enemy stat multiplier'),
  HARD_STAT_MULT: z.number().min(1.0).max(5.0).describe('Hard difficulty enemy stat multiplier'),
  NIGHTMARE_STAT_MULT: z.number().min(1.0).max(5.0).describe('Nightmare difficulty enemy stat multiplier'),
  ABYSS_STAT_MULT: z.number().min(1.0).max(10.0).describe('Abyss difficulty enemy stat multiplier'),
});

export type RiftBalanceConfig = z.infer<typeof riftBalanceSchema>;

export const RIFT_BALANCE_DEFAULTS: RiftBalanceConfig = {
  BASE_FLOOR_COUNT: 5,
  MAX_DAILY_RUNS: 3,
  ABANDON_COOLDOWN_SECONDS: 60,
  NORMAL_STAT_MULT: 1.1,
  HARD_STAT_MULT: 1.25,
  NIGHTMARE_STAT_MULT: 1.5,
  ABYSS_STAT_MULT: 1.75,
};
