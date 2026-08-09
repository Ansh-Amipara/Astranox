import type { PokemonEquippedMovesDto } from './MoveDto';

export interface OwnedPokemonDto {
  readonly id: string;
  readonly speciesId: number;
  readonly speciesName: string;
  readonly types: ReadonlyArray<string>;
  readonly level: number;
  readonly cp: number;
  readonly potential?: string;
  readonly currentXp: number;
  readonly isParty: boolean;
  readonly position: number;

  readonly ivHp: number;
  readonly ivAttack: number;
  readonly ivDefense: number;
  readonly ivSpAtk: number;
  readonly ivSpDef: number;
  readonly ivSpeed: number;
  readonly equippedMoves: ReadonlyArray<PokemonEquippedMovesDto>;
  readonly species: {
    readonly id: number;
    readonly name: string;
    readonly spriteUrl: string | null;
    readonly type1?: { name: string };
    readonly type2?: { name: string };
    readonly evolvesTo: ReadonlyArray<{ name: string; id: number }>;
    readonly evolutionLevel: number | null;
    readonly evolveByBattle: boolean;
    readonly megaEvolvesToIds: ReadonlyArray<number>;
    readonly gmaxEvolvesToIds: ReadonlyArray<number>;
    readonly hp: number;
    readonly attack: number;
    readonly defense: number;
    readonly spAtk: number;
    readonly spDef: number;
    readonly speed: number;
    readonly isMega: boolean;
    readonly isGmax: boolean;
  };
}

export interface PokemonSummaryDto {
  readonly id: string;
  readonly speciesId: number;
  readonly speciesName: string;
  readonly spriteUrl: string | null;
  readonly level: number;
  readonly cp: number;
  readonly potential?: string;
  readonly types: ReadonlyArray<string>;
  readonly isParty: boolean;

  readonly position: number;
}
