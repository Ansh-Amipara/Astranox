import { describe, it, expect } from 'vitest';
import {
  BALANCE_SECTIONS,
  BALANCE_SCHEMAS,
  BALANCE_DEFAULTS,
  battleBalanceSchema,
  economyBalanceSchema,
  limitsBalanceSchema,
} from '@astranox/constants';

describe('Balance Schemas and Defaults', () => {
  it('every balance section has an associated schema and default configuration', () => {
    for (const section of BALANCE_SECTIONS) {
      expect(BALANCE_SCHEMAS[section], `Schema missing for ${section}`).toBeDefined();
      expect(BALANCE_DEFAULTS[section], `Defaults missing for ${section}`).toBeDefined();
    }
  });

  it('all balance defaults satisfy their respective schemas without errors', () => {
    for (const section of BALANCE_SECTIONS) {
      const schema = BALANCE_SCHEMAS[section];
      const defaults = BALANCE_DEFAULTS[section];
      const parseResult = schema.safeParse(defaults);
      if (!parseResult.success) {
        console.error(`Validation failed for ${section}:`, parseResult.error.format());
      }
      expect(parseResult.success, `Defaults for ${section} must be valid`).toBe(true);
    }
  });

  it('rejects out-of-bounds balance overrides', () => {
    // Battle STAB multiplier below 1.0
    const invalidBattle = battleBalanceSchema.safeParse({
      ...BALANCE_DEFAULTS.battle,
      STAB_MULTIPLIER: 0.5,
    });
    expect(invalidBattle.success).toBe(false);

    // Economy sell ratio greater than 1.0 (free infinite money exploit)
    const invalidEconomy = economyBalanceSchema.safeParse({
      ...BALANCE_DEFAULTS.economy,
      SHOP_SELL_PRICE_RATIO: 1.5,
    });
    expect(invalidEconomy.success).toBe(false);

    // Max party size greater than 12
    const invalidLimits = limitsBalanceSchema.safeParse({
      ...BALANCE_DEFAULTS.limits,
      MAX_PARTY_SIZE: 99,
    });
    expect(invalidLimits.success).toBe(false);
  });
});
