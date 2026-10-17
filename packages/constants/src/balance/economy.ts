/**
 * Economy domain constants: currencies, defaults, payouts, and exchange ratios.
 */

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
