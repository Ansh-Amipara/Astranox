/**
 * Pure domain logic for Gen V+ Stat Calculations.
 * Delegated to canonical @astranox/constants balance rules.
 */

import { calculateHpFormula, calculateStatFormula } from '@astranox/constants';

/**
 * Calculates the maximum Hit Points (HP) of a Pokémon.
 * Formula (No EVs): floor( (2 * Base + IV) * Level / 100 ) + Level + 10
 * Note: Shedinja (Base HP 1) always has exactly 1 HP, regardless of IVs/Level.
 */
export function calculateHP(base: number, iv: number, level: number, isGmax: boolean = false): number {
  return calculateHpFormula(base, iv, level, isGmax);
}

/**
 * Calculates a non-HP stat (Attack, Defense, Sp. Atk, Sp. Def, Speed).
 * Formula (No EVs, No Natures): floor( (2 * Base + IV) * Level / 100 ) + 5
 */
export function calculateStat(base: number, iv: number, level: number): number {
  return calculateStatFormula(base, iv, level);
}
