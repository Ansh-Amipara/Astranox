export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export type StatusAilment =
  | 'burn'
  | 'freeze'
  | 'paralysis'
  | 'poison'
  | 'sleep'
  | 'none';

export interface MoveData {
  id: number;
  name: string;
  power: number;
  accuracy: number;
  type: PokemonType;
  damageClass: 'physical' | 'special' | 'status';
  priority?: number;
}

export interface BattlePokemon {
  id: string;
  speciesId: number;
  speciesName: string;
  level: number;
  types: PokemonType[];
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  status: StatusAilment;
  sleepTurnsRemaining?: number;
  moves: MoveData[];
  catchRate: number; // Species base catch rate (1-255)
  baseExp?: number;
}

export type PlayerAction =
  | { type: 'USE_MOVE'; moveId: number }
  | { type: 'SWITCH_POKEMON'; targetPokemonId: string }
  | { type: 'THROW_BALL'; ballType: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'RUN' };

export type BattleOutcome = 'WON' | 'CAPTURED' | 'DEFEATED' | 'FLED' | null;

export type TurnEvent =
  | { type: 'text'; text: string }
  | { type: 'move'; attackerId: string; defenderId: string; moveName: string; isPlayer: boolean }
  | {
      type: 'damage';
      targetId: string;
      damage: number;
      currentHp: number;
      maxHp: number;
      isCritical?: boolean;
      effectiveness?: number;
    }
  | { type: 'status_damage'; targetId: string; damage: number; currentHp: number; maxHp: number; status: StatusAilment }
  | { type: 'faint'; targetId: string; isPlayer: boolean }
  | { type: 'switch'; previousPokemonId: string; newPokemon: BattlePokemon; isPlayer: boolean }
  | { type: 'catch_attempt'; ballType: string; shakes: number; shakeChecks: boolean[]; success: boolean }
  | { type: 'run_attempt'; success: boolean }
  | { type: 'miss'; attackerId: string };

export interface BattleEngineState {
  battleId: string;
  turnNumber: number;
  playerActive: BattlePokemon;
  playerParty: BattlePokemon[];
  wildPokemon: BattlePokemon;
  outcome: BattleOutcome;
  seed: number;
  balanceVersion?: number;
}
