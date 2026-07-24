/**
 * Pure mathematical functions for Experience and Leveling.
 * House Rule: XP needed to level up from L to L+1 is L * 100.
 * This results in Total XP = 50 * L * (L - 1).
 */

/**
 * Calculates the total XP required to reach a specific level.
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * level * (level - 1);
}

/**
 * Calculates the current level based on total XP.
 * Solves the quadratic equation: XP = 50 * L^2 - 50 * L
 */
export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  const x = xp / 50;
  const level = Math.floor((1 + Math.sqrt(1 + 4 * x)) / 2);
  return Math.max(1, level);
}

/**
 * Calculates the XP yield from defeating a wild Pokemon.
 * Using BaseExp * Level / 5 for a balanced curve.
 */
export function getExpYield(baseExp: number, level: number): number {
  return Math.floor((baseExp * level) / 5);
}
