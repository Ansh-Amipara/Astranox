import { describe, it, expect } from 'vitest';
import { getXpForLevel, getLevelFromXp, getExpYield } from '../level-math';

describe('Level Math (Quadratic XP)', () => {
  it('calculates XP for level correctly', () => {
    expect(getXpForLevel(1)).toBe(0);
    expect(getXpForLevel(2)).toBe(100);
    expect(getXpForLevel(3)).toBe(300);
    expect(getXpForLevel(4)).toBe(600);
    expect(getXpForLevel(50)).toBe(122500); // 50 * 50 * 49 = 122500
    expect(getXpForLevel(100)).toBe(495000); // 50 * 100 * 99 = 495000
  });

  it('calculates Level from XP correctly', () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(99)).toBe(1);
    expect(getLevelFromXp(100)).toBe(2);
    expect(getLevelFromXp(299)).toBe(2);
    expect(getLevelFromXp(300)).toBe(3);
    expect(getLevelFromXp(122500)).toBe(50);
    expect(getLevelFromXp(495000)).toBe(100);
    expect(getLevelFromXp(1990000)).toBe(200);
    expect(getLevelFromXp(4995000)).toBe(316);
  });

  it('calculates XP yield correctly', () => {
    // Bulbasaur baseExp = 64. Level 5 -> 64 * 5 / 5 = 64
    expect(getExpYield(64, 5)).toBe(64);
  });
});
