import { PokemonInstancePayload, PokemonInstance } from './types';
import { calculateHP, calculateStat } from '../battle/stats';
import { calculatePokemonCP } from './cp';
import {
  getMaxLevelForPotential,
  RANK_ORDER,
  ProgressionBalanceConfig,
} from '@astranox/constants';

export { getMaxLevelForPotential };

export function getMinPotentialForLevel(level: number, minTier: string = 'F', config?: ProgressionBalanceConfig): string {
  const tiers = RANK_ORDER;

  let requiredTierIndex = tiers.length - 1;
  for (let i = 0; i < tiers.length; i++) {
    if (level <= getMaxLevelForPotential(tiers[i], config)) {
      requiredTierIndex = i;
      break;
    }
  }

  const minTierIndex = (tiers as readonly string[]).indexOf(minTier);
  return tiers[Math.max(requiredTierIndex, Math.max(0, minTierIndex))];
}

/**
 * Validates and constructs a fully hydrated PokemonInstance from a payload.
 * Pure logic function that uses the Phase 5 mathematical engine.
 */
export function createPokemonInstance(payload: PokemonInstancePayload, config?: ProgressionBalanceConfig): PokemonInstance {
  // 1. Validate IVs (Must be 0-31)
  const ivs = Object.values(payload.ivs);
  for (const iv of ivs) {
    if (iv < 0 || iv > 31) {
      throw new Error(`Invalid IV detected: ${iv}. IVs must be strictly between 0 and 31.`);
    }
  }

  // 2. Validate Level against Potential Cap
  const maxLevel = getMaxLevelForPotential(payload.potential, config);
  if (payload.level < 1 || payload.level > maxLevel) {
    throw new Error(`Invalid Level: ${payload.level}. Level must be strictly between 1 and ${maxLevel} for potential ${payload.potential}.`);
  }

  // 3. Hydrate Stats via Gen V Engine
  let maxHp = calculateHP(payload.species.baseStats.hp, payload.ivs.hp, payload.level, payload.species.isGmax);

  let stats = {
    attack: calculateStat(payload.species.baseStats.attack, payload.ivs.attack, payload.level),
    defense: calculateStat(payload.species.baseStats.defense, payload.ivs.defense, payload.level),
    spAtk: calculateStat(payload.species.baseStats.spAtk, payload.ivs.spAtk, payload.level),
    spDef: calculateStat(payload.species.baseStats.spDef, payload.ivs.spDef, payload.level),
    speed: calculateStat(payload.species.baseStats.speed, payload.ivs.speed, payload.level),
  };

  // 3.5 Apply Rift Corruption Modifiers
  if (payload.isCorrupted && payload.corruptedMultipliers) {
    maxHp = Math.floor(maxHp * payload.corruptedMultipliers.hp);
    stats.attack = Math.floor(stats.attack * payload.corruptedMultipliers.atk);
    stats.defense = Math.floor(stats.defense * payload.corruptedMultipliers.def);
    stats.spAtk = Math.floor(stats.spAtk * payload.corruptedMultipliers.spa);
    stats.spDef = Math.floor(stats.spDef * payload.corruptedMultipliers.spd);
    stats.speed = Math.floor(stats.speed * payload.corruptedMultipliers.spe);
  }


  // 4. Calculate CP
  const cp = calculatePokemonCP(
    payload.species.baseStats,
    payload.ivs,
    payload.level,
    payload.potential,
    payload.species.isGmax,
    payload.moves ? payload.moves.map(m => m.power || 0) : []
  );

  // 5. Return Combat Entity
  return {
    id: payload.id,
    name: payload.nickname || payload.species.name,
    level: payload.level,
    potential: payload.potential,
    currentXp: payload.currentXp || 0,
    types: payload.species.types,
    cp,
    isCorrupted: payload.isCorrupted || false,
    maxHp,
    currentHp: maxHp, // Fresh instances spawn at full health
    stats,
    ivs: payload.ivs,
    species: payload.species,
    moves: payload.moves || []
  };
}
