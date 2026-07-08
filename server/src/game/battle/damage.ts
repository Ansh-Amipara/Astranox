/**
 * Pure domain logic for Gen V+ Damage and Accuracy Calculations.
 */

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
  if (ctx.movePower === 0) return 0;
  
  // Step 1: Base damage
  const levelMult = Math.floor((2 * ctx.attackerLevel) / 5) + 2;
  const statMult = Math.floor(levelMult * ctx.movePower * (ctx.attackerAttack / ctx.defenderDefense));
  const baseDamage = Math.floor(statMult / 50) + 2;

  let currentDamage = baseDamage;

  // Step 2: Critical Hit
  if (ctx.isCriticalHit) {
    currentDamage = Math.floor(currentDamage * 1.5);
  }

  // Step 3: STAB (Same Type Attack Bonus)
  if (ctx.attackerTypes.includes(ctx.moveType)) {
    currentDamage = Math.floor(currentDamage * 1.5);
  }

  // Step 4: Type Effectiveness
  currentDamage = Math.floor(currentDamage * ctx.typeEffectivenessMultiplier);

  // Note: Random roll (0.85 to 1.00) intentionally omitted.
  
  // Prevents dealing 0 damage if it's not an immunity
  if (ctx.typeEffectivenessMultiplier > 0 && currentDamage === 0) {
    return 1;
  }

  return currentDamage;
}

/**
 * Checks if a move hits based on accuracy.
 * @param moveAccuracy The accuracy of the move (0-100), or null if it always hits.
 * @param rngOverride Optional mock RNG value (1-100) for deterministic testing.
 * @returns boolean True if it hits, False if it misses.
 */
export function checkAccuracy(moveAccuracy: number | null, rngOverride?: number): boolean {
  if (moveAccuracy === null) return true;
  
  const roll = rngOverride ?? Math.floor(Math.random() * 100) + 1; // 1 to 100
  return roll <= moveAccuracy;
}
