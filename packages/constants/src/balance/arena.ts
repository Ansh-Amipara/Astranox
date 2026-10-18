import { z } from 'zod';

/**
 * Arena domain balance constants and schema.
 */

export const arenaBalanceSchema = z.object({
  DEFAULT_COOLDOWN_SECONDS: z.number().min(0).max(86400).describe('Default cooldown in seconds between arena matches'),
  WIN_COINS_MULTIPLIER: z.number().min(1).max(1000).describe('Coins per level multiplier awarded on arena victory'),
  MIN_PARTY_SIZE: z.number().min(1).max(6).describe('Minimum player party size required to enter arena'),
  MAX_PARTY_SIZE: z.number().min(1).max(6).describe('Maximum team size for arena encounters'),
});

export type ArenaBalanceConfig = z.infer<typeof arenaBalanceSchema>;

export const ARENA_BALANCE_DEFAULTS: ArenaBalanceConfig = {
  DEFAULT_COOLDOWN_SECONDS: 0,
  WIN_COINS_MULTIPLIER: 30,
  MIN_PARTY_SIZE: 1,
  MAX_PARTY_SIZE: 6,
};
