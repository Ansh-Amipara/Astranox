/**
 * Pure mathematical functions for Experience and Leveling.
 * Backed by canonical @astranox/constants balance rules.
 */

export {
  getXpForLevel,
  getLevelFromXp,
  getExpYield,
  PROGRESSION_CONSTANTS,
} from '@astranox/constants';

export function xpRequiredForLevelUp(_level?: number): number {
  return 100;
}
