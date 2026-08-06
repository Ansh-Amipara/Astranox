/**
 * Pure mathematical functions for Experience and Leveling.
 * House Rule: XP needed to level up from L to L+1 is L * 100.
 * This results in Total XP = 50 * L * (L - 1).
 */

function xpRequiredForLevelUp(level: number): number {
  if (level < 10) return 100;
  if (level < 20) return 200;
  if (level < 30) return 300;
  if (level < 40) return 400;
  if (level < 50) return 500;
  if (level < 60) return 600;
  if (level < 70) return 700;
  if (level < 80) return 800;
  if (level < 90) return 900;
  if (level < 100) return 1000;
  if (level < 1000) return 5000;
  if (level < 10000) return 20000;
  return 50000;
}

/**
 * Calculates the total XP required to reach a specific level.
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += xpRequiredForLevelUp(i);
  }
  return xp;
}

/**
 * Calculates the current level based on total XP.
 */
export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  let level = 1;
  let remainingXp = xp;
  while (true) {
    const required = xpRequiredForLevelUp(level);
    if (remainingXp >= required) {
      remainingXp -= required;
      level++;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Calculates the XP yield from defeating a wild Pokemon.
 * Using BaseExp * Level / 5 for a balanced curve.
 */
export function getExpYield(baseExp: number, level: number): number {
  return Math.floor((baseExp * level) / 5);
}
