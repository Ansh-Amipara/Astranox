import { z } from 'zod';

/**
 * Battle domain balance constants and formulas.
 * Canonical to Gen V+ mechanics as enforced by AGENTS.md.
 */

export const battleBalanceSchema = z.object({
  STAB_MULTIPLIER: z.number().min(1.0).max(3.0).describe('STAB (Same Type Attack Bonus) multiplier'),
  CRITICAL_HIT_MULTIPLIER: z.number().min(1.0).max(3.0).describe('Critical hit damage multiplier'),
  BASE_DAMAGE_OFFSET: z.number().min(0).max(20).describe('Gen V+ base damage additive offset'),
  BASE_DAMAGE_DIVISOR: z.number().min(1).max(200).describe('Gen V+ base damage formula divisor'),
  LEVEL_SCALING_OFFSET: z.number().min(0).max(10).describe('Intermediate level scaling offset'),
  LEVEL_SCALING_FACTOR: z.number().min(0.01).max(2.0).describe('Intermediate level scaling multiplier: 2 / 5'),
  MIN_DAMAGE: z.number().min(0).max(100).describe('Minimum guaranteed damage when effectiveness > 0'),
  HP_BASE_OFFSET: z.number().min(0).max(50).describe('Base HP calculation additive offset: +10'),
  STAT_BASE_OFFSET: z.number().min(0).max(50).describe('Non-HP stat calculation additive offset: +5'),
  STAT_BASE_MULTIPLIER: z.number().min(1).max(10).describe('Stat calculation base stat multiplier: 2'),
  STAT_LEVEL_DIVISOR: z.number().min(1).max(500).describe('Stat calculation level divisor: 100'),
  GMAX_HP_MULTIPLIER: z.number().min(1).max(5).describe('Gigantamax HP multiplier'),
  SHEDINJA_HP: z.number().min(1).max(1).describe('Shedinja base HP hardcoded exception'),
  MIN_IV: z.number().min(0).max(31).describe('Minimum individual value (IV)'),
  MAX_IV: z.number().min(0).max(31).describe('Maximum individual value (IV)'),
  MAX_ACCURACY: z.number().min(1).max(100).describe('Maximum accuracy roll threshold'),
});

export type BattleBalanceConfig = z.infer<typeof battleBalanceSchema>;

export const BATTLE_CONSTANTS = {
  /** STAB (Same Type Attack Bonus) multiplier */
  STAB_MULTIPLIER: 1.5,

  /** Critical hit damage multiplier */
  CRITICAL_HIT_MULTIPLIER: 1.5,

  /** Gen V+ base damage additive offset */
  BASE_DAMAGE_OFFSET: 2,

  /** Gen V+ base damage formula divisor */
  BASE_DAMAGE_DIVISOR: 50,

  /** Intermediate level scaling offset */
  LEVEL_SCALING_OFFSET: 2,

  /** Intermediate level scaling multiplier: 2 / 5 */
  LEVEL_SCALING_FACTOR: 0.4,

  /** Minimum guaranteed damage when effectiveness > 0 */
  MIN_DAMAGE: 1,

  /** Base HP calculation additive offset: +10 */
  HP_BASE_OFFSET: 10,

  /** Non-HP stat calculation additive offset: +5 */
  STAT_BASE_OFFSET: 5,

  /** Stat calculation base stat multiplier: 2 */
  STAT_BASE_MULTIPLIER: 2,

  /** Stat calculation level divisor: 100 */
  STAT_LEVEL_DIVISOR: 100,

  /** Gigantamax HP multiplier */
  GMAX_HP_MULTIPLIER: 2,

  /** Shedinja base HP hardcoded exception */
  SHEDINJA_HP: 1,

  /** Minimum individual value (IV) */
  MIN_IV: 0,

  /** Maximum individual value (IV) */
  MAX_IV: 31,

  /** Maximum accuracy roll threshold */
  MAX_ACCURACY: 100,
} as const;

export interface DamageCalculationParams {
  attackerLevel: number;
  attackerAttack: number;
  defenderDefense: number;
  movePower: number;
  isCriticalHit?: boolean;
  isStab?: boolean;
  typeEffectivenessMultiplier: number;
}

/**
 * Calculates Gen 5 damage with intermediate integer truncation.
 * Formula: floor( floor( floor( 2 * Level / 5 + 2 ) * Power * A / D ) / 50 ) + 2
 */
export function calculateDamageFormula(params: DamageCalculationParams): number {
  if (params.movePower === 0) return 0;

  const levelMult = Math.floor((2 * params.attackerLevel) / 5) + BATTLE_CONSTANTS.LEVEL_SCALING_OFFSET;
  const statMult = Math.floor(
    levelMult * params.movePower * (params.attackerAttack / params.defenderDefense)
  );
  const baseDamage = Math.floor(statMult / BATTLE_CONSTANTS.BASE_DAMAGE_DIVISOR) + BATTLE_CONSTANTS.BASE_DAMAGE_OFFSET;

  let currentDamage = baseDamage;

  if (params.isCriticalHit) {
    currentDamage = Math.floor(currentDamage * BATTLE_CONSTANTS.CRITICAL_HIT_MULTIPLIER);
  }

  if (params.isStab) {
    currentDamage = Math.floor(currentDamage * BATTLE_CONSTANTS.STAB_MULTIPLIER);
  }

  currentDamage = Math.floor(currentDamage * params.typeEffectivenessMultiplier);

  if (params.typeEffectivenessMultiplier > 0 && currentDamage === 0) {
    return BATTLE_CONSTANTS.MIN_DAMAGE;
  }

  return currentDamage;
}

/**
 * Calculates HP for a Pokémon instance without EVs.
 * Formula: floor( (2 * Base + IV) * Level / 100 ) + Level + 10
 */
export function calculateHpFormula(base: number, iv: number, level: number, isGmax: boolean = false): number {
  if (base === 1) {
    return BATTLE_CONSTANTS.SHEDINJA_HP;
  }
  const step1 = Math.floor(((BATTLE_CONSTANTS.STAT_BASE_MULTIPLIER * base + iv) * level) / BATTLE_CONSTANTS.STAT_LEVEL_DIVISOR);
  const hp = step1 + level + BATTLE_CONSTANTS.HP_BASE_OFFSET;
  return isGmax ? hp * BATTLE_CONSTANTS.GMAX_HP_MULTIPLIER : hp;
}

/**
 * Calculates a non-HP stat for a Pokémon instance without EVs/Natures.
 * Formula: floor( (2 * Base + IV) * Level / 100 ) + 5
 */
export function calculateStatFormula(base: number, iv: number, level: number): number {
  const step1 = Math.floor(((BATTLE_CONSTANTS.STAT_BASE_MULTIPLIER * base + iv) * level) / BATTLE_CONSTANTS.STAT_LEVEL_DIVISOR);
  return step1 + BATTLE_CONSTANTS.STAT_BASE_OFFSET;
}
