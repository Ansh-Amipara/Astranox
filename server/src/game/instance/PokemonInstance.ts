import { PokemonInstancePayload, PokemonInstance } from './types';
import { calculateHP, calculateStat } from '../battle/stats';

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

  // 2. Validate Level (1-100)
  if (payload.level < 1 || payload.level > 100) {
    throw new Error(`Invalid Level: ${payload.level}. Level must be strictly between 1 and 100.`);
  }

  // 3. Hydrate Stats via Gen V Engine
  const maxHp = calculateHP(payload.species.baseStats.hp, payload.ivs.hp, payload.level);
  
  const stats = {
    attack: calculateStat(payload.species.baseStats.attack, payload.ivs.attack, payload.level),
    defense: calculateStat(payload.species.baseStats.defense, payload.ivs.defense, payload.level),
    spAtk: calculateStat(payload.species.baseStats.spAtk, payload.ivs.spAtk, payload.level),
    spDef: calculateStat(payload.species.baseStats.spDef, payload.ivs.spDef, payload.level),
    speed: calculateStat(payload.species.baseStats.speed, payload.ivs.speed, payload.level),
  };

  // 4. Return Combat Entity
  return {
    id: payload.id,
    name: payload.nickname || payload.species.name,
    level: payload.level,
    types: payload.species.types,
    
    maxHp,
    currentHp: maxHp, // Fresh instances spawn at full health
    stats,
    
    ivs: payload.ivs,
    species: payload.species
  };
}
