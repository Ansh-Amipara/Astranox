import { ActivePokemon } from './types';

/**
 * Applies the Level Difference Stat Scaling house rule.
 * If the level gap between two Pokémon is > 5, the lower-level Pokémon's stats 
 * (Attack, Defense, SpAtk, SpDef, Speed) are reduced by 10% for every level gap above 5,
 * capped at a maximum of 50% reduction (a gap of 10 levels).
 */
export function applyLevelScaling(p1: ActivePokemon, p2: ActivePokemon): { p1: ActivePokemon, p2: ActivePokemon } {
  // Clone to avoid mutating original state references before the turn starts
  const p1Scaled = { ...p1 };
  const p2Scaled = { ...p2 };

  const levelGap = Math.abs(p1.level - p2.level);

  if (levelGap > 5) {
    const penaltyLevels = Math.min(levelGap - 5, 5); // Max 5 levels of penalty (50%)
    const penaltyMultiplier = 1 - (penaltyLevels * 0.10);

    if (p1.level < p2.level) {
      applyPenalty(p1Scaled, penaltyMultiplier);
    } else {
      applyPenalty(p2Scaled, penaltyMultiplier);
    }
  }

  return { p1: p1Scaled, p2: p2Scaled };
}

function applyPenalty(p: ActivePokemon, multiplier: number) {
  p.attack = Math.max(1, Math.floor(p.attack * multiplier));
  p.defense = Math.max(1, Math.floor(p.defense * multiplier));
  p.spAtk = Math.max(1, Math.floor(p.spAtk * multiplier));
  p.spDef = Math.max(1, Math.floor(p.spDef * multiplier));
  p.speed = Math.max(1, Math.floor(p.speed * multiplier));
}
