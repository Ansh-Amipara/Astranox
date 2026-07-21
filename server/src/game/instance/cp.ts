import { calculateHP, calculateStat } from '../battle/stats';

/**
 * Maps PokemonPotential enum strings to their CP multiplier values.
 * Scales exponentially to reflect the massive power gaps between rarities.
 */
export const POTENTIAL_CP_MULTIPLIER: Record<string, number> = {
  BLACK_IRON: 1.0,
  BRONZE: 1.2,
  SILVER: 1.5,
  GOLD: 2.0,
  PLATINUM: 3.0,
  ADAMANTITE: 5.0,
  DIAMOND: 8.0,
  CRYSTAL: 12.0,
  EPIC: 18.0,
  HEROIC: 25.0,
  SOVEREIGN: 40.0,
  LEGENDARY: 60.0,
  DIVINE: 100.0,
  CELESTIAL: 150.0,
  PRIMORDIAL: 250.0,
  MYTHICAL: 400.0,
  INFINITY: 700.0,
  ETERNAL: 1000.0,
};

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
 * CP = Floor( (Sum of Calculated Stats) * Level * PotentialMultiplier / 10 )
 */
export function calculatePokemonCP(
  baseStats: BaseStats,
  ivs: IVs,
  level: number,
  potential: string
): number {
  const maxHp = calculateHP(baseStats.hp, ivs.hp, level);
  const atk = calculateStat(baseStats.attack, ivs.attack, level);
  const def = calculateStat(baseStats.defense, ivs.defense, level);
  const spa = calculateStat(baseStats.spAtk, ivs.spAtk, level);
  const spd = calculateStat(baseStats.spDef, ivs.spDef, level);
  const spe = calculateStat(baseStats.speed, ivs.speed, level);

  const statSum = maxHp + atk + def + spa + spd + spe;
  const pMultiplier = POTENTIAL_CP_MULTIPLIER[potential] || 1.0;

  return Math.floor((statSum * level * pMultiplier) / 10);
}
