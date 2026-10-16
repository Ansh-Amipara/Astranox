/**
 * Pure mathematical functions for Experience and Leveling.
 * Each level requires 100 XP to level up:
 * level 1 = 001-100 xp (and 0 xp is level 1)
 * level 2 = 101-200 xp
 * level 3 = 201-300 xp
 */

export function xpRequiredForLevelUp(_level?: number): number {
  return 100;
}

/**
 * Calculates the minimum XP required to reach a specific level.
 * Level 1 = 0 XP
 * Level 2 = 101 XP
 * Level 3 = 201 XP
 * Level L = (L - 1) * 100 + 1
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * 100 + 1;
}

/**
 * Calculates the current level based on total XP.
 * 0-100 XP => Level 1
 * 101-200 XP => Level 2
 * 201-300 XP => Level 3
 */
export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor((xp - 1) / 100) + 1;
}

/**
 * Calculates the XP yield from defeating a wild Pokemon.
 * Using BaseExp * Level / 5 for a balanced curve.
 */
export function getExpYield(baseExp: number, level: number): number {
  return Math.floor((baseExp * level) / 5);
}
