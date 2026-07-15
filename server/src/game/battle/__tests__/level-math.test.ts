import { describe, it, expect } from 'vitest';
import { getXpForLevel, getLevelFromXp, getExpYield } from '../level-math';

describe('Level Math (Flat XP)', () => {
  it('calculates XP for level correctly', () => {
    expect(getXpForLevel(1)).toBe(1000);
    expect(getXpForLevel(2)).toBe(2000);
    expect(getXpForLevel(50)).toBe(50000);
    expect(getXpForLevel(100)).toBe(100000);
  });

  it('calculates Level from XP correctly', () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(999)).toBe(1);
    expect(getLevelFromXp(2000)).toBe(2);
    expect(getLevelFromXp(2500)).toBe(2);
    expect(getLevelFromXp(50000)).toBe(50);
    expect(getLevelFromXp(125000)).toBe(125);
    expect(getLevelFromXp(999999)).toBe(200);
  });

  it('calculates XP yield correctly', () => {
    // Bulbasaur baseExp = 64. Level 5 -> 64 * 5 / 7 = 45.7 -> 45
    expect(getExpYield(64, 5)).toBe(45);
  });
});
