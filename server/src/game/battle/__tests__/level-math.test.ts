import { describe, it, expect } from 'vitest';
import { getXpForLevel, getLevelFromXp, getExpYield } from '../level-math';

describe('Level Math (Gen V+)', () => {
  it('calculates XP for level correctly (Medium Fast)', () => {
    expect(getXpForLevel(1)).toBe(0);
    expect(getXpForLevel(2)).toBe(8);
    expect(getXpForLevel(50)).toBe(125000);
    expect(getXpForLevel(100)).toBe(1000000);
  });

  it('calculates Level from XP correctly (Medium Fast)', () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(7)).toBe(1);
    expect(getLevelFromXp(8)).toBe(2);
    expect(getLevelFromXp(125000)).toBe(50);
    expect(getLevelFromXp(999999)).toBe(99);
    expect(getLevelFromXp(1000000)).toBe(100);
    expect(getLevelFromXp(2000000)).toBe(100); // Wait, my code currently doesn't cap at 100 on the upper bound logic if it exceeds 100^3. I should fix it if needed, but it's clamped by Math.min(100, rawLevel). Let's see: if rawLevel is 125, min(100, 125) is 100. But the rawLevel+1 check might return 126.
  });

  it('calculates XP yield correctly', () => {
    // Bulbasaur baseExp = 64. Level 5 -> 64 * 5 / 7 = 45.7 -> 45
    expect(getExpYield(64, 5)).toBe(45);
  });
});
