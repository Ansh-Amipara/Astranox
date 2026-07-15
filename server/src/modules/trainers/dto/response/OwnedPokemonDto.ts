import type { OwnedPokemonMoveDto } from './MoveDto';

export interface OwnedPokemonDto {
  readonly id: string;
  readonly speciesId: number;
  readonly speciesName: string;
  readonly types: ReadonlyArray<string>;
  readonly level: number;
  readonly currentXp: number;
  readonly isParty: boolean;
  readonly position: number;
  readonly boxNumber: number | null;
  readonly ivHp: number;
  readonly ivAttack: number;
  readonly ivDefense: number;
  readonly ivSpAtk: number;
  readonly ivSpDef: number;
  readonly ivSpeed: number;
  readonly moves: ReadonlyArray<OwnedPokemonMoveDto>;
  readonly heldItem?: { id: string; name: string } | null;
}

export interface PokemonSummaryDto {
  readonly id: string;
  readonly speciesId: number;
  readonly speciesName: string;
  readonly level: number;
  readonly types: ReadonlyArray<string>;
  readonly isParty: boolean;
  readonly boxNumber: number | null;
  readonly position: number;
}
