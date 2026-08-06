import { describe, it, expect } from 'vitest';
import { calculateHP, calculateStat } from '../stats';

describe('Gen 5 Stat Calculations (EVs/Natures Removed)', () => {
  it('calculates HP correctly without EVs', () => {
    // Base 100, IV 31, Level 50
    // Math: floor(((2*100 + 31) * 50) / 100) + 50 + 10 = floor((231 * 50) / 100) + 60 = 115 + 60 = 175
    expect(calculateHP(100, 31, 50)).toBe(175);
  });

  it('calculates non-HP stats correctly without EVs/Natures', () => {
    // Base 130, IV 31, Level 50
    // Math: floor(((2*130 + 31) * 50) / 100) + 5 = floor((291 * 50) / 100) + 5 = 145 + 5 = 150
    expect(calculateStat(130, 31, 50)).toBe(150);
  });

  it('enforces Shedinja 1 HP rule', () => {
    // Base HP: 1. IV: 31, Level 100.
    expect(calculateHP(1, 31, 100)).toBe(1);
  });
});
