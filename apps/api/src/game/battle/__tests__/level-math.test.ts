import { describe, it, expect } from 'vitest';
import { getXpForLevel, getLevelFromXp, getExpYield } from '../level-math';

describe('Level Math (100 XP per level)', () => {
  it('calculates XP for level correctly', () => {
    expect(getXpForLevel(1)).toBe(0);
    expect(getXpForLevel(2)).toBe(101);
    expect(getXpForLevel(3)).toBe(201);
    expect(getXpForLevel(4)).toBe(301);
    expect(getXpForLevel(50)).toBe(4901);
    expect(getXpForLevel(100)).toBe(9901);
  });

  it('calculates Level from XP correctly', () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(1)).toBe(1);
    expect(getLevelFromXp(100)).toBe(1);
    expect(getLevelFromXp(101)).toBe(2);
    expect(getLevelFromXp(200)).toBe(2);
    expect(getLevelFromXp(201)).toBe(3);
    expect(getLevelFromXp(300)).toBe(3);
    expect(getLevelFromXp(4901)).toBe(50);
    expect(getLevelFromXp(5000)).toBe(50);
    expect(getLevelFromXp(9901)).toBe(100);
    expect(getLevelFromXp(10000)).toBe(100);
  });

  it('calculates XP yield correctly', () => {
    // Bulbasaur baseExp = 64. Level 5 -> 64 * 5 / 5 = 64
    expect(getExpYield(64, 5)).toBe(64);
  });
});
