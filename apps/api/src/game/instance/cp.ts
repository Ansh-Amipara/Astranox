import { calculateHP, calculateStat } from '../battle/stats';

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface IVs {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

/**
 * Calculates Combat Power (CP) using the formula:
 * CP = (Sum of Calculated Stats) * 100
 */
export function calculatePokemonCP(
  baseStats: BaseStats,
  ivs: IVs,
  level: number,
  _potential?: string,
  isGmax: boolean = false,
  movePowers: number[] = []
): number {
  // 1. Calculate final raw stats using standard logic
  const maxHp = calculateHP(baseStats.hp, ivs.hp, level, isGmax);
  const atk = calculateStat(baseStats.attack, ivs.attack, level);
  const def = calculateStat(baseStats.defense, ivs.defense, level);
  const spa = calculateStat(baseStats.spAtk, ivs.spAtk, level);
  const spd = calculateStat(baseStats.spDef, ivs.spDef, level);
  const spe = calculateStat(baseStats.speed, ivs.speed, level);

  const statSum = maxHp + atk + def + spa + spd + spe;

  // 2. Calculate Move Synergy
  // If movePowers is empty, estimate a reasonable move power based on level for tower/NPC generation
  let totalMovePower = 0;
  if (movePowers.length > 0) {
    totalMovePower = movePowers.reduce((sum, p) => sum + (p === 0 ? 60 : p), 0);
  } else {
    // Estimate: Level * 1.5 average power per move, assuming 4 moves
    totalMovePower = Math.floor((level * 1.5 + 20) * 4);
  }

  // 3. Apply Formula
  const baseStatValue = statSum * 10;
  const moveSynergyValue = statSum * (totalMovePower / 4);

  return Math.floor(baseStatValue + moveSynergyValue);
}
