import { describe, it, expect } from 'vitest';
import {
  calculateDamageFormula,
  calculateHpFormula,
  calculateStatFormula,
  getXpForLevel,
  getLevelFromXp,
  getExpYield,
  getBallBonusMultiplier,
  getStatusBonusMultiplier,
  getMaxLevelForPotential,
  BATTLE_CONSTANTS,
  CATCH_CONSTANTS,
  ECONOMY_CONSTANTS,
  PROGRESSION_CONSTANTS,
  LIMIT_CONSTANTS,
} from '@astranox/constants';

describe('Game Balance Constants & Formulas', () => {
  describe('Battle Stat & Damage Formulas', () => {
    it('calculates HP accurately and handles Shedinja exception', () => {
      // Shedinja base HP 1 must always result in 1 HP
      expect(calculateHpFormula(1, 31, 50)).toBe(BATTLE_CONSTANTS.SHEDINJA_HP);
      expect(calculateHpFormula(1, 0, 100)).toBe(BATTLE_CONSTANTS.SHEDINJA_HP);

      // Standard Pokemon: Base 100, IV 31, Level 50
      // floor((2 * 100 + 31) * 50 / 100) + 50 + 10 = floor(231 * 50 / 100) + 60 = 115 + 60 = 175
      expect(calculateHpFormula(100, 31, 50)).toBe(175);

      // Gigantamax doubles max HP
      expect(calculateHpFormula(100, 31, 50, true)).toBe(350);
    });

    it('calculates non-HP stats accurately', () => {
      // Base 100, IV 31, Level 50
      // floor((2 * 100 + 31) * 50 / 100) + 5 = 115 + 5 = 120
      expect(calculateStatFormula(100, 31, 50)).toBe(120);

      // Base 50, IV 0, Level 100
      // floor((2 * 50 + 0) * 100 / 100) + 5 = 100 + 5 = 105
      expect(calculateStatFormula(50, 0, 100)).toBe(105);
    });

    it('calculates Gen 5 damage with intermediate truncation', () => {
      // Level 50, Power 90, Attack 100, Defense 100, 1x effectiveness
      // levelMult = floor(2 * 50 / 5) + 2 = 22
      // statMult = floor(22 * 90 * (100 / 100)) = 1980
      // baseDamage = floor(1980 / 50) + 2 = 39 + 2 = 41
      const dmg = calculateDamageFormula({
        attackerLevel: 50,
        movePower: 90,
        attackerAttack: 100,
        defenderDefense: 100,
        typeEffectivenessMultiplier: 1.0,
      });
      expect(dmg).toBe(41);

      // With STAB (+50% truncated)
      const stabDmg = calculateDamageFormula({
        attackerLevel: 50,
        movePower: 90,
        attackerAttack: 100,
        defenderDefense: 100,
        isStab: true,
        typeEffectivenessMultiplier: 1.0,
      });
      expect(stabDmg).toBe(Math.floor(41 * 1.5)); // 61

      // Immunity returns 0 damage
      const immuneDmg = calculateDamageFormula({
        attackerLevel: 50,
        movePower: 90,
        attackerAttack: 100,
        defenderDefense: 100,
        typeEffectivenessMultiplier: 0,
      });
      expect(immuneDmg).toBe(0);

      // Low damage with effectiveness > 0 guarantees at least 1 damage
      const minDmg = calculateDamageFormula({
        attackerLevel: 1,
        movePower: 10,
        attackerAttack: 5,
        defenderDefense: 255,
        typeEffectivenessMultiplier: 0.25,
      });
      expect(minDmg).toBe(1);
    });
  });

  describe('Catch Formulas & Multipliers', () => {
    it('returns correct ball multipliers', () => {
      expect(getBallBonusMultiplier('poke-ball')).toBe(1.0);
      expect(getBallBonusMultiplier('great-ball')).toBe(1.5);
      expect(getBallBonusMultiplier('ultra-ball')).toBe(2.0);
      expect(getBallBonusMultiplier('master-ball')).toBe(255.0);
      expect(getBallBonusMultiplier('unknown-ball')).toBe(1.0);
    });

    it('returns correct status multipliers', () => {
      expect(getStatusBonusMultiplier('sleep')).toBe(2.5);
      expect(getStatusBonusMultiplier('freeze')).toBe(2.5);
      expect(getStatusBonusMultiplier('paralysis')).toBe(1.5);
      expect(getStatusBonusMultiplier('poison')).toBe(1.5);
      expect(getStatusBonusMultiplier('burn')).toBe(1.5);
      expect(getStatusBonusMultiplier(null)).toBe(1.0);
    });
  });

  describe('Progression & Leveling Formulas', () => {
    it('computes level from XP and XP for level symmetrically', () => {
      expect(getXpForLevel(1)).toBe(0);
      expect(getXpForLevel(2)).toBe(101);
      expect(getXpForLevel(5)).toBe(401);
      expect(getXpForLevel(50)).toBe(4901);

      expect(getLevelFromXp(0)).toBe(1);
      expect(getLevelFromXp(100)).toBe(1);
      expect(getLevelFromXp(101)).toBe(2);
      expect(getLevelFromXp(401)).toBe(5);
      expect(getLevelFromXp(4901)).toBe(50);
    });

    it('computes correct wild exp yield', () => {
      // 64 baseExp, level 5 -> floor(64 * 5 / 5) = 64
      expect(getExpYield(64, 5)).toBe(64);
      // 100 baseExp, level 10 -> 200
      expect(getExpYield(100, 10)).toBe(200);
    });

    it('caps potential tiers appropriately', () => {
      expect(getMaxLevelForPotential('F')).toBe(25);
      expect(getMaxLevelForPotential('E')).toBe(50);
      expect(getMaxLevelForPotential('A')).toBe(200);
      expect(getMaxLevelForPotential('EX')).toBe(5000);
    });
  });

  describe('Domain Constants Integrity', () => {
    it('verifies essential constants are defined and non-zero', () => {
      expect(ECONOMY_CONSTANTS.STARTER_ASTRAL_COINS).toBe(3000);
      expect(ECONOMY_CONSTANTS.SMELT_XP_RATIO).toBe(0.6);
      expect(ECONOMY_CONSTANTS.SHOP_SELL_PRICE_RATIO).toBe(0.75);

      expect(LIMIT_CONSTANTS.MAX_PARTY_SIZE).toBe(6);
      expect(LIMIT_CONSTANTS.MAX_EQUIPPED_MOVES).toBe(4);
      expect(LIMIT_CONSTANTS.IDEMPOTENCY_TTL_SECONDS).toBe(86400);

      expect(PROGRESSION_CONSTANTS.XP_PER_LEVEL).toBe(100);
    });
  });
});
