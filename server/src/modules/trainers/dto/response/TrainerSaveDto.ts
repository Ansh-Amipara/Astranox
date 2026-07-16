import type { OwnedPokemonDto } from './OwnedPokemonDto';

export interface InventoryItemDto {
  readonly itemId: string;
  readonly quantity: number;
  readonly item: {
    readonly name: string;
    readonly description: string;
    readonly spriteUrl: string | null;
    readonly category: string;
  };
}

export interface TrainerSaveDto {
  readonly id: string;
  readonly userId: string;
  readonly money: number;
  readonly rank: string;
  readonly starterChosenAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly party: ReadonlyArray<OwnedPokemonDto>;
  readonly inventory: ReadonlyArray<InventoryItemDto>;
}
