import { z } from 'zod';

/**
 * Economy domain constants: currencies, defaults, payouts, and exchange ratios.
 */

export const economyBalanceSchema = z.object({
  STARTER_ASTRAL_COINS: z.number().min(0).max(10000000).describe('Initial Astral Coins granted upon trainer save creation'),
  STARTER_INFINITY_COINS: z.number().min(0).max(10000000).describe('Initial Infinity Coins granted upon trainer save creation'),
  SMELT_XP_RATIO: z.number().min(0.0).max(2.0).describe('Percentage of current XP awarded when smelting a Pokémon'),
  SHOP_SELL_PRICE_RATIO: z.number().min(0.0).max(1.0).describe('Percentage of item base cost refunded when selling to shop'),
  DEFAULT_SHOP_ITEM_COST: z.number().min(1).max(1000000).describe('Fallback default shop item unit cost'),
  MIN_AUDIT_REASON_LENGTH: z.number().min(1).max(50).describe('Minimum reason length for modifying economy and shop catalog actions'),
});

export type EconomyBalanceConfig = z.infer<typeof economyBalanceSchema>;

export const ECONOMY_CONSTANTS = {
  /** Initial Astral Coins granted upon trainer save creation */
  STARTER_ASTRAL_COINS: 3000,

  /** Initial Infinity Coins granted upon trainer save creation */
  STARTER_INFINITY_COINS: 0,

  /** Percentage of current XP awarded when smelting a Pokémon: 60% */
  SMELT_XP_RATIO: 0.6,

  /** Percentage of item base cost refunded when selling to shop: 75% */
  SHOP_SELL_PRICE_RATIO: 0.75,

  /** Fallback default shop item unit cost */
  DEFAULT_SHOP_ITEM_COST: 100,

  /** Minimum reason length for modifying economy and shop catalog actions */
  MIN_AUDIT_REASON_LENGTH: 5,
} as const;
