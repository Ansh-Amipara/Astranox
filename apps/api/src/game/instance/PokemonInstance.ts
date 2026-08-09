import { PokemonInstancePayload, PokemonInstance } from './types';
import { calculateHP, calculateStat } from '../battle/stats';
import { calculatePokemonCP } from './cp';

export function getMaxLevelForPotential(potential: string): number {
  switch (potential) {
    case 'G': return 50;
    case 'F': return 100;
    case 'E': return 250;
    case 'D': return 500;
    case 'C': return 1000;
    case 'B': return 1500;
    case 'A': return 2000;
    case 'S_MINUS': return 3000;
    case 'S': return 4000;
    case 'S_PLUS': return 5000;
    case 'SS_MINUS': return 6000;
    case 'SS': return 7000;
    case 'SS_PLUS': return 8000;
    case 'SSS_MINUS': return 10000;
    case 'SSS': return 12000;
    case 'SSS_PLUS': return 14000;
    case 'EX_MINUS': return 16000;
    case 'EX': return 18000;
    case 'EX_PLUS': return 20000;
    default: return 20000;
  }
}

export function getMinPotentialForLevel(level: number, minTier: string = 'G'): string {
  const tiers = [
    'G', 'F', 'E', 'D', 'C', 'B', 'A',
    'S_MINUS', 'S', 'S_PLUS',
    'SS_MINUS', 'SS', 'SS_PLUS',
    'SSS_MINUS', 'SSS', 'SSS_PLUS',
    'EX_MINUS', 'EX', 'EX_PLUS'
  ];

  let requiredTierIndex = tiers.length - 1;
  for (let i = 0; i < tiers.length; i++) {
    if (level <= getMaxLevelForPotential(tiers[i])) {
      requiredTierIndex = i;
      break;
    }
  }

  const minTierIndex = tiers.indexOf(minTier);
  return tiers[Math.max(requiredTierIndex, Math.max(0, minTierIndex))];
}

/**
 * Validates and constructs a fully hydrated PokemonInstance from a payload.
 * Pure logic function that uses the Phase 5 mathematical engine.
 */
export function createPokemonInstance(payload: PokemonInstancePayload): PokemonInstance {
  // 1. Validate IVs (Must be 0-31)
  const ivs = Object.values(payload.ivs);
  for (const iv of ivs) {
    if (iv < 0 || iv > 31) {
      throw new Error(`Invalid IV detected: ${iv}. IVs must be strictly between 0 and 31.`);
    }
  }

  // 2. Validate Level against Potential Cap
  const maxLevel = getMaxLevelForPotential(payload.potential);
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
