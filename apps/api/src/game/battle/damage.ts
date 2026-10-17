/**
 * Pure domain logic for Gen V+ Damage and Accuracy Calculations.
 * Delegated to canonical @astranox/constants balance rules.
 */

import { calculateDamageFormula, BATTLE_CONSTANTS } from '@astranox/constants';

export interface DamageContext {
  attackerLevel: number;
  attackerAttack: number;
  defenderDefense: number;
  movePower: number;
  moveType: string;
  attackerTypes: string[];
  typeEffectivenessMultiplier: number;
  isCriticalHit?: boolean;
}

/**
 * Calculates exact Gen 5 damage.
 * Formula: floor( floor( floor( 2 * Level / 5 + 2 ) * Power * A / D ) / 50 ) + 2
 * Note: The random damage modifier (0.85-1.00) is omitted per project rules.
 */
export function calculateDamage(ctx: DamageContext): number {
  return calculateDamageFormula({
    attackerLevel: ctx.attackerLevel,
    attackerAttack: ctx.attackerAttack,
    defenderDefense: ctx.defenderDefense,
    movePower: ctx.movePower,
    isCriticalHit: ctx.isCriticalHit,
    isStab: ctx.attackerTypes.includes(ctx.moveType),
    typeEffectivenessMultiplier: ctx.typeEffectivenessMultiplier,
  });
}

/**
 * Checks if a move hits based on accuracy.
 * @param moveAccuracy The accuracy of the move (0-100), or null if it always hits.
 * @param rngOverride Optional mock RNG value (1-100) for deterministic testing.
 * @returns boolean True if it hits, False if it misses.
 */
export function checkAccuracy(moveAccuracy: number | null, rngOverride?: number): boolean {
  if (moveAccuracy === null) return true;
  
  const roll = rngOverride ?? Math.floor(Math.random() * BATTLE_CONSTANTS.MAX_ACCURACY) + 1;
  return roll <= moveAccuracy;
}
