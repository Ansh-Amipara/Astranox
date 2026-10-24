export interface WeightedItem {
  weight: number;
}

/**
 * Pure, deterministic weighted selection.
 * @param entries Array of items each having a non-negative weight.
 * @param rng Optional RNG generator returning a float in [0, 1). Defaults to Math.random.
 */
export function rollWeightedEntry<T extends WeightedItem>(
  entries: T[],
  rng: () => number = Math.random
): T {
  if (!entries || entries.length === 0) {
    throw new Error('Cannot roll from an empty list of weighted entries');
  }

  const totalWeight = entries.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  if (totalWeight <= 0) {
    return entries[0];
  }

  const roll = rng() * totalWeight;
  let accumulated = 0;

  for (const item of entries) {
    const w = Math.max(0, item.weight);
    accumulated += w;
    if (roll < accumulated) {
      return item;
    }
  }

  return entries[entries.length - 1];
}

/**
 * Pure, deterministic level roll within a level range [min, max].
 */
export function rollLevel(
  minLevel: number,
  maxLevel: number,
  rng: () => number = Math.random
): number {
  const span = Math.max(0, maxLevel - minLevel);
  return minLevel + Math.floor(rng() * (span + 1));
}
