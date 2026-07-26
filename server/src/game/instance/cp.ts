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
 * CP = Floor( (Sum of Calculated Stats) * Level / 10 )
 */
export function calculatePokemonCP(
  baseStats: BaseStats,
  ivs: IVs,
  level: number,
  potential: string,
  isGmax: boolean = false
): number {
  // 1. Calculate final raw stats using standard logic
  const maxHp = calculateHP(baseStats.hp, ivs.hp, level, isGmax);
  const atk = calculateStat(baseStats.attack, ivs.attack, level);
  const def = calculateStat(baseStats.defense, ivs.defense, level);
  const spa = calculateStat(baseStats.spAtk, ivs.spAtk, level);
  const spd = calculateStat(baseStats.spDef, ivs.spDef, level);
  const spe = calculateStat(baseStats.speed, ivs.speed, level);

  const statSum = maxHp + atk + def + spa + spd + spe;

  return Math.floor((statSum * level) / 10);
}
