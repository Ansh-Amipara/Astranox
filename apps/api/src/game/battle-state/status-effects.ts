import { ActivePokemon, TurnEvent } from './types';

/**
 * Checks if a Pokémon can attack this turn based on volatile status effects.
 * Also processes thaw and sleep timers.
 */
export function checkCanAttack(pokemon: ActivePokemon, rngOverride?: number): { canAttack: boolean, event?: TurnEvent } {
  if (pokemon.status === 'paralysis') {
    const roll = rngOverride ?? Math.random();
    // 25% chance to be fully paralyzed
    if (roll < 0.25) {
      return { 
        canAttack: false, 
        event: { type: 'status_effect', pokemonId: pokemon.id, status: 'paralysis', message: 'is fully paralyzed!' } 
      };
    }
  }

  if (pokemon.status === 'freeze') {
    const roll = rngOverride ?? Math.random();
    // 20% chance to thaw
    if (roll < 0.20) {
      pokemon.status = null;
      return { 
        canAttack: true, 
        event: { type: 'status_cleared', pokemonId: pokemon.id, status: 'freeze' } 
      };
    } else {
      return { 
        canAttack: false, 
        event: { type: 'status_effect', pokemonId: pokemon.id, status: 'freeze', message: 'is frozen solid!' } 
      };
    }
  }

  if (pokemon.status === 'sleep') {
    if (pokemon.sleepTurns && pokemon.sleepTurns > 0) {
      pokemon.sleepTurns -= 1;
      return { 
        canAttack: false, 
        event: { type: 'status_effect', pokemonId: pokemon.id, status: 'sleep', message: 'is fast asleep.' } 
      };
    } else {
      pokemon.status = null;
      pokemon.sleepTurns = undefined;
      return { 
        canAttack: true, 
        event: { type: 'status_cleared', pokemonId: pokemon.id, status: 'sleep' } 
      };
    }
  }

  return { canAttack: true };
}

/**
 * Applies end-of-turn residual damage for Burn and Poison (1/16 Max HP).
 */
export function applyResidualDamage(pokemon: ActivePokemon): TurnEvent | null {
  if (pokemon.status === 'burn' || pokemon.status === 'poison') {
    const damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
    pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
    
    return {
      type: 'status_effect',
      pokemonId: pokemon.id,
      status: pokemon.status,
      message: pokemon.status === 'burn' ? 'was hurt by its burn!' : 'was hurt by poison!',
      damage
    };
  }
  return null;
}
