import { describe, it, expect } from 'vitest';
import { calculateHP, calculateStat } from '../stats';

describe('Gen 5 Stat Calculations (EVs/Natures Removed)', () => {
  it('calculates HP correctly using exact Gen 5 truncation', () => {
    // Example: Garchomp at Level 50
    // Base HP: 108. Let's say IV is 31.
    // Formula: floor( (2 * 108 + 31) * 50 / 100 ) + 50 + 10
    // (216 + 31) = 247
    // floor( 247 * 50 / 100 ) = floor( 123.5 ) = 123
    // 123 + 50 + 10 = 183
    
    expect(calculateHP(108, 31, 50)).toBe(183);
  });

  it('calculates non-HP stats correctly using exact Gen 5 truncation', () => {
    // Example: Garchomp Attack at Level 50
    // Base Attack: 130. IV: 31.
    // Formula: floor( (2 * 130 + 31) * 50 / 100 ) + 5
    // (260 + 31) = 291
    // floor( 291 * 50 / 100 ) = floor( 145.5 ) = 145
    // 145 + 5 = 150
    
    expect(calculateStat(130, 31, 50)).toBe(150);
  });

  it('enforces Shedinja 1 HP rule', () => {
    // Base HP: 1. IV: 31, Level 100.
    expect(calculateHP(1, 31, 100)).toBe(1);
  });
});
