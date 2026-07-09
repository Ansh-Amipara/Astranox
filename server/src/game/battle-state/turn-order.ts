import { ActivePokemon, BattleAction } from './types';

/**
 * Determines which Pokémon moves first.
 * Returns { first: 'p1' | 'p2' }
 */
export function determineFirstStriker(
  p1: ActivePokemon,
  p1Action: BattleAction,
  p2: ActivePokemon,
  p2Action: BattleAction,
  rngOverride?: number
): 'p1' | 'p2' {
  // 1. Priority bracket
  if (p1Action.move.priority > p2Action.move.priority) return 'p1';
  if (p2Action.move.priority > p1Action.move.priority) return 'p2';

  // 2. Speed tie-breaker
  const p1Speed = getEffectiveSpeed(p1);
  const p2Speed = getEffectiveSpeed(p2);

  if (p1Speed > p2Speed) return 'p1';
  if (p2Speed > p1Speed) return 'p2';

  // 3. Random speed tie
  const roll = rngOverride ?? Math.random();
  return roll < 0.5 ? 'p1' : 'p2';
}

function getEffectiveSpeed(pokemon: ActivePokemon): number {
  let speed = pokemon.speed;
  
  // Paralysis reduces speed by 50% in Gen 7+
  if (pokemon.status === 'paralysis') {
    speed = Math.floor(speed * 0.5);
  }

  // TODO: Apply speed stage multipliers (-6 to 6) in the future

  return speed;
}
