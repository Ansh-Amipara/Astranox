import { describe, it, expect } from 'vitest';
import {
  getLevelFromXp,
  getXpForLevel,
  getExpYield,
  getMaxLevelForPotential,
  PROGRESSION_CONSTANTS,
  ECONOMY_CONSTANTS,
  XP_CANDY_VALUES,
  CURRENT_DATA_VERSION,
} from '@astranox/constants';
import { migrateOnRead } from '../../../migrations/migrate-on-read';
import { ShopService } from '../../../modules/shop/shop.service';

describe('Part 3: Leveling, Experience & Economy Architecture', () => {
  describe('Flat 100 XP per Level Formula', () => {
    it('calculates level accurately using Level = floor(currentXp / 100) + 1', () => {
      expect(getLevelFromXp(0)).toBe(1);
      expect(getLevelFromXp(50)).toBe(1);
      expect(getLevelFromXp(99)).toBe(1);

      // 1 Level up
      expect(getLevelFromXp(100)).toBe(2);
      expect(getLevelFromXp(150)).toBe(2);
      expect(getLevelFromXp(199)).toBe(2);

      // Multi-level up
      expect(getLevelFromXp(200)).toBe(3);
      expect(getLevelFromXp(500)).toBe(6);
      expect(getLevelFromXp(9900)).toBe(100);
    });

    it('calculates XP for level accurately using (L - 1) * 100', () => {
      expect(getXpForLevel(1)).toBe(0);
      expect(getXpForLevel(2)).toBe(100);
      expect(getXpForLevel(3)).toBe(200);
      expect(getXpForLevel(10)).toBe(900);
      expect(getXpForLevel(100)).toBe(9900);
      expect(getXpForLevel(5000)).toBe(499900);
    });

    it('enforces absolute maximum level cap of 5000', () => {
      expect(PROGRESSION_CONSTANTS.ABSOLUTE_MAX_LEVEL).toBe(5000);
      expect(getLevelFromXp(499900)).toBe(5000);
      expect(getLevelFromXp(500000)).toBe(5000);
      expect(getLevelFromXp(1000000)).toBe(5000);
    });

    it('respects potential tier caps', () => {
      expect(getMaxLevelForPotential('F')).toBe(25);
      expect(getMaxLevelForPotential('E')).toBe(50);
      expect(getMaxLevelForPotential('D')).toBe(75);
      expect(getMaxLevelForPotential('C')).toBe(100);
      expect(getMaxLevelForPotential('B')).toBe(150);
      expect(getMaxLevelForPotential('A')).toBe(200);
      expect(getMaxLevelForPotential('EX')).toBe(5000);

      // Test level capping with potential limit
      const fCap = getMaxLevelForPotential('F');
      expect(getLevelFromXp(10000, undefined, fCap)).toBe(25);

      const aCap = getMaxLevelForPotential('A');
      expect(getLevelFromXp(50000, undefined, aCap)).toBe(200);
    });
  });

  describe('Battle XP Scaling with Opponent Level', () => {
    it('scales linearly with opponent level', () => {
      const baseExp = 100;
      const yieldLvl5 = getExpYield(baseExp, 5);
      const yieldLvl10 = getExpYield(baseExp, 10);
      const yieldLvl50 = getExpYield(baseExp, 50);
      const yieldLvl100 = getExpYield(baseExp, 100);

      // (100 * 5) / 5 = 100
      expect(yieldLvl5).toBe(100);
      // (100 * 10) / 5 = 200 (double level 5)
      expect(yieldLvl10).toBe(200);
      // (100 * 50) / 5 = 1000 (10x level 5)
      expect(yieldLvl50).toBe(1000);
      // (100 * 100) / 5 = 2000 (20x level 5)
      expect(yieldLvl100).toBe(2000);
    });
  });

  describe('Pokémart XP Candies & Configurable Coin Ratio', () => {
    it('defines XP candy values across full tier spectrum including XXL and MAX', () => {
      expect(XP_CANDY_VALUES['exp-candy-xs']).toBe(100);
      expect(XP_CANDY_VALUES['exp-candy-s']).toBe(800);
      expect(XP_CANDY_VALUES['exp-candy-m']).toBe(3000);
      expect(XP_CANDY_VALUES['exp-candy-l']).toBe(10000);
      expect(XP_CANDY_VALUES['exp-candy-xl']).toBe(30000);
      expect(XP_CANDY_VALUES['exp-candy-xxl']).toBe(100000);
      expect(XP_CANDY_VALUES['exp-candy-max']).toBe(500000);
    });

    it('calculates effective price using default 1 coin : 1 XP baseline ratio', () => {
      const fakeLock = {} as any;
      const fakeFlag = {} as any;
      const shopService = new ShopService(fakeLock, fakeFlag);

      const xsItem = { price: 100, salePrice: null, saleStartsAt: null, saleEndsAt: null, category: 'xp_candies', key: 'exp-candy-xs' };
      const xlItem = { price: 30000, salePrice: null, saleStartsAt: null, saleEndsAt: null, category: 'xp_candies', key: 'exp-candy-xl' };
      const xxlItem = { price: 100000, salePrice: null, saleStartsAt: null, saleEndsAt: null, category: 'xp_candies', key: 'exp-candy-xxl' };
      const maxItem = { price: 500000, salePrice: null, saleStartsAt: null, saleEndsAt: null, category: 'xp_candies', key: 'exp-candy-max' };

      expect(shopService.calculateEffectivePrice(xsItem, 1.0).effectivePrice).toBe(100);
      expect(shopService.calculateEffectivePrice(xlItem, 1.0).effectivePrice).toBe(30000);
      expect(shopService.calculateEffectivePrice(xxlItem, 1.0).effectivePrice).toBe(100000);
      expect(shopService.calculateEffectivePrice(maxItem, 1.0).effectivePrice).toBe(500000);
    });

    it('scales dynamic candy price when staff configures custom XP_CANDY_COIN_RATIO', () => {
      const fakeLock = {} as any;
      const fakeFlag = {} as any;
      const shopService = new ShopService(fakeLock, fakeFlag);

      const xxlItem = { price: 100000, salePrice: null, saleStartsAt: null, saleEndsAt: null, category: 'xp_candies', key: 'exp-candy-xxl' };

      // Half price promo (0.5 coins per 1 XP)
      expect(shopService.calculateEffectivePrice(xxlItem, 0.5).effectivePrice).toBe(50000);

      // 2.0x coin ratio
      expect(shopService.calculateEffectivePrice(xxlItem, 2.0).effectivePrice).toBe(200000);
    });
  });

  describe('Versioned Data Migration for Existing Pokémon', () => {
    it('migrates legacy OwnedPokemon to v2 with recalculated level on read', () => {
      const legacyPokemon = {
        id: 'legacy-pkm-1',
        speciesId: 1,
        potential: 'C',
        currentXp: 450, // Under flat formula: floor(450 / 100) + 1 = 5
        level: 4, // Legacy outdated level
        dataVersion: 1,
      };

      const migrated = migrateOnRead('OWNED_POKEMON', legacyPokemon as any);
      expect(migrated.dataVersion).toBe(CURRENT_DATA_VERSION.OWNED_POKEMON);
      expect(migrated.level).toBe(5);
    });

    it('preserves potential cap when migrating legacy Pokémon with high XP', () => {
      const legacyCappedPokemon = {
        id: 'legacy-pkm-2',
        speciesId: 25,
        potential: 'F', // Potential F max level is 25
        currentXp: 10000,
        level: 20,
        dataVersion: 1,
      };

      const migrated = migrateOnRead('OWNED_POKEMON', legacyCappedPokemon as any);
      expect(migrated.dataVersion).toBe(CURRENT_DATA_VERSION.OWNED_POKEMON);
      expect(migrated.level).toBe(25);
    });
  });
});
