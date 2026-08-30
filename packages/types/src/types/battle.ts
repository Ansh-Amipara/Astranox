import { OwnedPokemonDto } from './pokemon';

export type StatusAilmentDto = 'burn' | 'poison' | 'paralysis' | 'sleep' | 'freeze' | null;

export interface PokemonMoveDto {
  readonly moveId: number;
  readonly currentSlot: number;
  readonly name: string;
  readonly type: string;
}

export interface ActivePokemonDto {
  readonly id: string; // unique instance id
  readonly speciesId: number;
  readonly speciesName: string;
  readonly level: number;
  readonly potential: string;
  readonly types: string[]; // ["fire", "flying"]
  readonly rank: string;
  readonly moves: PokemonMoveDto[];
  
  // Base effective stats (already calculated with IVs)
  readonly maxHp: number;
  readonly currentHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly spAtk: number;
  readonly spDef: number;
  readonly speed: number;
  
  readonly catchRate: number; // For wild Pokemon catch math
  readonly baseExp: number;
  readonly currentXp: number;
  
  // Volatile State
  readonly status: StatusAilmentDto;
  readonly sleepTurns?: number; // How many turns of sleep remaining
  
  // Stat stages (-6 to 6)
  readonly stages: {
    readonly attack: number;
    readonly defense: number;
    readonly spAtk: number;
    readonly spDef: number;
    readonly speed: number;
    readonly accuracy: number;
    readonly evasion: number;
  };
}

export type TurnEventDto = 
  | { readonly type: 'move'; readonly pokemonId: string; readonly moveName: string }
  | { readonly type: 'switch'; readonly pokemonId: string; readonly targetPokemonId: string; readonly name: string; readonly isPlayer: boolean }
  | { readonly type: 'opponent_switch'; readonly pokemonId: string; readonly pokemonName: string }
  | { readonly type: 'miss'; readonly pokemonId: string }
  | { readonly type: 'damage'; readonly pokemonId: string; readonly amount: number; readonly isCritical: boolean; readonly effectiveness: number }
  | { readonly type: 'status_inflicted'; readonly pokemonId: string; readonly status: StatusAilmentDto }
  | { readonly type: 'status_effect'; readonly pokemonId: string; readonly status: StatusAilmentDto; readonly message: string; readonly damage?: number }
  | { readonly type: 'status_cleared'; readonly pokemonId: string; readonly status: StatusAilmentDto }
  | { readonly type: 'flinch'; readonly pokemonId: string }
  | { readonly type: 'faint'; readonly pokemonId: string }
  | { readonly type: 'catch_attempt'; readonly pokemonId: string; readonly itemId: string; readonly success: boolean; readonly shakes: number }
  | { readonly type: 'xp_gain'; readonly pokemonId: string; readonly amount: number }
  | { readonly type: 'level_up'; readonly pokemonId: string; readonly level: number }
  | { readonly type: 'learned_move'; readonly pokemonId: string; readonly moveName: string }
  | { readonly type: 'prompt_learn_move'; readonly pokemonId: string; readonly moveId: number; readonly moveName: string }
  | { readonly type: 'skipped_move'; readonly pokemonId: string }
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'fled'; readonly pokemonId: string }
  | { readonly type: 'coin_reward'; readonly amount: number; readonly message: string }
  | { readonly type: 'stored_xp_gain'; readonly amount: number; readonly message: string }
  | { readonly type: 'item_received'; readonly item: string; readonly message: string }
  | { readonly type: 'rank_promotion'; readonly rank: string; readonly message: string }
  | { readonly type: 'tower_cleared'; readonly message: string };

export type BattleSessionDto = Readonly<{
  id: string;
  trainerId: string;
  status: string;
  battleType: string;
  turnNumber: number;
  playerActivePokemonId: string;
  opponentPokemonData: ActivePokemonDto;
  opponentPartyData: OwnedPokemonDto[] | null;
  playerPokemonData: ActivePokemonDto;
  playerPartyData: OwnedPokemonDto[] | null;
  log: {
    turn: number;
    events: TurnEventDto[];
  }[] | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}>;
