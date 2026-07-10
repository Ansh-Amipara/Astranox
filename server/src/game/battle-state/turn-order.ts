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
  // 0. Switch Priority (+7) and Item Priority (+6)
  const getActionPriority = (a: BattleAction) => {
    if (a.type === 'switch') return 7;
    if (a.type === 'item') return 6;
    return a.move.priority;
  };

  const p1Priority = getActionPriority(p1Action);
  const p2Priority = getActionPriority(p2Action);

  if (p1Priority > p2Priority) return 'p1';
  if (p2Priority > p1Priority) return 'p2';

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
