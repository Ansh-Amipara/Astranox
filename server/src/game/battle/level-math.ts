/**
 * Pure mathematical functions for Experience and Leveling.
 * House Rule: Flat experience curve. 1,000 XP = 1 Level.
 */

/**
 * Calculates the total XP required to reach a specific level.
 * Using House Rule: XP = Level * 1000
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 1000;
  return level * 1000;
}

/**
 * Calculates the current level based on total XP.
 * Using House Rule: Level = Math.floor(XP / 1000)
 */
export function getLevelFromXp(xp: number): number {
  if (xp < 1000) return 1;
  return Math.min(200, Math.floor(xp / 1000));
}

/**
 * Calculates the XP yield from defeating a wild Pokemon.
 * Gen 5+ simplified formula: (BaseExp * Level) / 7
 */
export function getExpYield(baseExp: number, level: number): number {
  return Math.floor((baseExp * level) / 7);
}
