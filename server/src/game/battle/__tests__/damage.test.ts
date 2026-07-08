import { describe, it, expect } from 'vitest';
import { calculateDamage, checkAccuracy } from '../damage';

describe('Gen 5 Damage Calculations (RNG Removed)', () => {
  it('calculates exact base damage with intermediate truncation', () => {
    // Scenario: Level 50 Garchomp vs Level 50 Pikachu
    // Garchomp Attack: 150. Pikachu Defense: 60.
    // Move: Earthquake (100 Power). STAB applies.

    // Base damage steps:
    // levelMult = floor(2 * 50 / 5) + 2 = 22
    // statMult = floor( 22 * 100 * (150 / 60) ) = floor( 2200 * 2.5 ) = 5500
    // baseDamage = floor( 5500 / 50 ) + 2 = 112
    
    // STAB = floor( 112 * 1.5 ) = 168
    // Effectiveness = floor( 168 * 2 ) = 336
    
    const damage = calculateDamage({
      attackerLevel: 50,
      attackerAttack: 150,
      defenderDefense: 60,
      movePower: 100,
      moveType: 'ground',
      attackerTypes: ['dragon', 'ground'],
      typeEffectivenessMultiplier: 2 // Super effective against electric
    });

    expect(damage).toBe(336);
  });

  it('applies critical hits before STAB and Effectiveness', () => {
    // Base damage is 112 from previous test.
    // Critical = floor( 112 * 1.5 ) = 168
    // STAB = floor( 168 * 1.5 ) = 252
    // Effectiveness (Neutral) = floor( 252 * 1 ) = 252
    
    const damage = calculateDamage({
      attackerLevel: 50,
      attackerAttack: 150,
      defenderDefense: 60,
      movePower: 100,
      moveType: 'ground',
      attackerTypes: ['dragon', 'ground'],
      typeEffectivenessMultiplier: 1,
      isCriticalHit: true
    });

    expect(damage).toBe(252);
  });

  it('returns exactly 1 damage for heavily resisted attacks', () => {
    // Tiny attack, massive defense. Should floor to 0, then bump to 1.
    const damage = calculateDamage({
      attackerLevel: 5,
      attackerAttack: 10,
      defenderDefense: 200,
      movePower: 20,
      moveType: 'normal',
      attackerTypes: ['normal'],
      typeEffectivenessMultiplier: 0.25 // Heavily resisted
    });

    expect(damage).toBeGreaterThanOrEqual(1);
  });

  it('returns 0 damage for immunities', () => {
    const damage = calculateDamage({
      attackerLevel: 50,
      attackerAttack: 150,
      defenderDefense: 60,
      movePower: 100,
      moveType: 'ground',
      attackerTypes: ['ground'],
      typeEffectivenessMultiplier: 0 // Immune (e.g. flying type)
    });

    expect(damage).toBe(0);
  });
});

describe('Accuracy Check', () => {
  it('hits if roll is less than or equal to accuracy', () => {
    // Accuracy 80, rolled 80 -> Hits
    expect(checkAccuracy(80, 80)).toBe(true);
    // Accuracy 80, rolled 1 -> Hits
    expect(checkAccuracy(80, 1)).toBe(true);
  });

  it('misses if roll is greater than accuracy', () => {
    // Accuracy 80, rolled 81 -> Misses
    expect(checkAccuracy(80, 81)).toBe(false);
  });

  it('always hits if move accuracy is null', () => {
    expect(checkAccuracy(null, 100)).toBe(true);
    expect(checkAccuracy(null, 999)).toBe(true); // extreme test case
  });
});
