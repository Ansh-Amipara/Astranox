export interface MoveDto {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly power: number | null;
  readonly damageClass: string;
}

export interface PokemonEquippedMovesDto {
  readonly moveId: number;
  readonly slot: number;
  readonly move: MoveDto;
}
