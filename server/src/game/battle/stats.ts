/**
 * Pure domain logic for Gen V+ Stat Calculations.
 * IMPORTANT: Effort Values (EVs) and Natures have been explicitly removed 
 * from these mechanics per the project's house rules.
 */

/**
 * Calculates the maximum Hit Points (HP) of a Pokémon.
 * Formula (No EVs): floor( (2 * Base + IV) * Level / 100 ) + Level + 10
 * Note: Shedinja (Base HP 1) always has exactly 1 HP, regardless of IVs/Level.
 */
export function calculateHP(base: number, iv: number, level: number): number {
  if (base === 1) {
    return 1; // Shedinja rule
  }
  
  const step1 = Math.floor(((2 * base + iv) * level) / 100);
  return step1 + level + 10;
}

/**
 * Calculates a non-HP stat (Attack, Defense, Sp. Atk, Sp. Def, Speed).
 * Formula (No EVs, No Natures): floor( (2 * Base + IV) * Level / 100 ) + 5
 */
export function calculateStat(base: number, iv: number, level: number): number {
  const step1 = Math.floor(((2 * base + iv) * level) / 100);
  return step1 + 5;
}
