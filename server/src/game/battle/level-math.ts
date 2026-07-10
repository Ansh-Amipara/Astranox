/**
 * Pure mathematical functions for Experience and Leveling.
 * Uses the Medium Fast experience curve (n^3) which is standard for most Pokemon.
 */

/**
 * Calculates the total XP required to reach a specific level.
 * Using Medium Fast curve: XP = n^3
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(Math.pow(level, 3));
}

/**
 * Calculates the current level based on total XP.
 * Using Medium Fast curve: Level = cube_root(XP)
 */
export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  const rawLevel = Math.floor(Math.pow(xp, 1/3));
  // JavaScript floating point precision might make cube_root(8) slightly less than 2, so let's be safe:
  // (Math.pow(8, 1/3) = 2, but just in case, we check if rawLevel+1 is valid)
  if (getXpForLevel(rawLevel + 1) <= xp) {
    return Math.min(100, rawLevel + 1);
  }
  return Math.min(100, Math.max(1, rawLevel));
}

/**
 * Calculates the XP yield from defeating a wild Pokemon.
 * Gen 5+ simplified formula: (BaseExp * Level) / 7
 */
export function getExpYield(baseExp: number, level: number): number {
  return Math.floor((baseExp * level) / 7);
}
