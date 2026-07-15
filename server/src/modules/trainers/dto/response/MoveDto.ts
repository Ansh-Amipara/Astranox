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
