export type StatusAilment = 'burn' | 'poison' | 'paralysis' | 'sleep' | 'freeze' | null;

export interface ActivePokemon {
  id: string; // unique instance id
  speciesName: string;
  level: number;
  types: string[]; // ["fire", "flying"]
  
  // Base effective stats (already calculated with IVs)
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  
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

export interface BattleAction {
  pokemonId: string;
  move: {
    name: string;
    power: number | null;
    accuracy: number | null;
    type: string;
    priority: number;
    damageClass: 'physical' | 'special' | 'status';
    ailment?: string | null;
    ailmentChance?: number | null;
    flinchChance?: number | null;
    statChanges?: any | null; // Placeholder for now
  };
  typeEffectivenessMultiplier: number; // Injected by caller
}

export type TurnEvent = 
  | { type: 'move'; pokemonId: string; moveName: string }
  | { type: 'miss'; pokemonId: string }
  | { type: 'damage'; pokemonId: string; amount: number; isCritical: boolean; effectiveness: number }
  | { type: 'status_inflicted'; pokemonId: string; status: StatusAilment }
  | { type: 'status_effect'; pokemonId: string; status: StatusAilment; message: string; damage?: number }
  | { type: 'status_cleared'; pokemonId: string; status: StatusAilment }
  | { type: 'flinch'; pokemonId: string }
  | { type: 'faint'; pokemonId: string };

export interface TurnResult {
  p1State: ActivePokemon;
  p2State: ActivePokemon;
  events: TurnEvent[];
}
