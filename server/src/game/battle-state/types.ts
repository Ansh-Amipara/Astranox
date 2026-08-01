export type StatusAilment = 'burn' | 'poison' | 'paralysis' | 'sleep' | 'freeze' | null;

export interface PokemonMove {
  moveId: number;
  currentSlot: number;
  name: string;
  type: string;
}

export interface ActivePokemon {
  id: string; // unique instance id
  speciesId: number;
  speciesName: string;
  level: number;
  potential: string;
  types: string[]; // ["fire", "flying"]
  moves: PokemonMove[];
  
  // Base effective stats (already calculated with IVs)
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  
  catchRate: number; // For wild Pokemon catch math
  baseExp: number;
  currentXp: number;
  
  // Volatile State
  status: StatusAilment;
  sleepTurns?: number; // How many turns of sleep remaining
  
  // Stat stages (-6 to 6)
  stages: {
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
    accuracy: number;
    evasion: number;
  };
}

export type BattleAction = 
  | {
      type: 'move';
      pokemonId: string;
      move: {
        name: string;
        power: number | null;
        
        type: string;
        
        damageClass: 'physical' | 'special' | 'status';
        
        
        
        statChanges?: any | null;
      };
      typeEffectivenessMultiplier: number;
    }
  | {
      type: 'item';
      pokemonId: string; // The active pokemon using the item (usually player)
      itemId: string;
      ballBonus: number;
    }
  | {
      type: 'switch';
      pokemonId: string; // The active pokemon doing the switching
      targetPokemonId: string; // The new pokemon entering battle
    };

export type TurnEvent = 
  | { type: 'move'; pokemonId: string; moveName: string }
  | { type: 'switch'; pokemonId: string; targetPokemonId: string; name: string; isPlayer: boolean }
  | { type: 'opponent_switch'; pokemonId: string; pokemonName: string }
  | { type: 'miss'; pokemonId: string }
  | { type: 'damage'; pokemonId: string; amount: number; isCritical: boolean; effectiveness: number }
  | { type: 'status_inflicted'; pokemonId: string; status: StatusAilment }
  | { type: 'status_effect'; pokemonId: string; status: StatusAilment; message: string; damage?: number }
  | { type: 'status_cleared'; pokemonId: string; status: StatusAilment }
  | { type: 'flinch'; pokemonId: string }
  | { type: 'faint'; pokemonId: string }
  | { type: 'catch_attempt'; pokemonId: string; itemId: string; success: boolean; shakes: number }
  | { type: 'xp_gain'; pokemonId: string; amount: number }
  | { type: 'level_up'; pokemonId: string; level: number }
  | { type: 'learned_move'; pokemonId: string; moveName: string }
  | { type: 'prompt_learn_move'; pokemonId: string; moveId: number; moveName: string }
  | { type: 'skipped_move'; pokemonId: string }
  | { type: 'text'; text: string }
  | { type: 'fled'; pokemonId: string }
  | { type: 'coin_reward'; amount: number; message: string }
  | { type: 'stored_xp_gain'; amount: number; message: string }
  | { type: 'item_received'; item: string; message: string }
  | { type: 'rank_promotion'; rank: string; message: string }
  | { type: 'tower_cleared'; message: string };

export interface TurnResult {
  p1State: ActivePokemon;
  p2State: ActivePokemon;
  events: TurnEvent[];
}
