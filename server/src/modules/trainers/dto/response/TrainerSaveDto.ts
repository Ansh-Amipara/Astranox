import type { OwnedPokemonDto } from './OwnedPokemonDto';

export interface InventoryItemDto {
  readonly itemId: string;
  readonly quantity: number;
  readonly item: {
    readonly name: string;
    readonly description: string;
    readonly spriteUrl: string | null;
  };
}

export interface TrainerSaveDto {
  readonly id: string;
  readonly userId: string;
  readonly money: number;
  readonly starterChosenAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly party: ReadonlyArray<OwnedPokemonDto>;
  readonly inventory: ReadonlyArray<InventoryItemDto>;
}
