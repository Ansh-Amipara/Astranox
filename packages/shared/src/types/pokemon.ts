export interface MoveDto {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly power: number | null;
  readonly accuracy: number | null;
  readonly damageClass: string;
}

export interface OwnedPokemonMoveDto {
  readonly moveId: number;
  readonly slot: number;
  readonly move: MoveDto;
}

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
  readonly boxNumber: number | null;
  readonly nickname?: string | null;
  readonly isBound?: boolean;
  readonly isEscrowed?: boolean;
  readonly ivHp: number;
  readonly ivAttack: number;
  readonly ivDefense: number;
  readonly ivSpAtk: number;
  readonly ivSpDef: number;
  readonly ivSpeed: number;
  readonly equippedMoves: ReadonlyArray<OwnedPokemonMoveDto>;
  readonly species: {
    readonly id: number;
    readonly name: string;
    readonly spriteUrl: string | null;
    readonly type1?: { name: string };
    readonly type2?: { name: string };
    readonly evolvesToId: number | null;
    readonly evolvesTo?: { name: string; id: number } | null;
    readonly evolutionLevel: number | null;
    readonly evolutionItem: string | null;
    readonly hp: number;
    readonly attack: number;
    readonly defense: number;
    readonly spAtk: number;
    readonly spDef: number;
    readonly speed: number;
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
  readonly boxNumber: number | null;
}

export interface TypeDto {
  readonly id: number;
  readonly name: string;
}

export interface SpeciesDto {
  readonly id: number;
  readonly name: string;
  readonly spriteUrl: string;
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly spAtk: number;
  readonly spDef: number;
  readonly speed: number;
  readonly type1: TypeDto;
  readonly type2?: TypeDto | null;
  readonly isMega: boolean;
  readonly isGmax: boolean;
  readonly baseSpeciesId: number | null;
  readonly pokedexNumber: number | null;
  readonly category?: string | null;
}
