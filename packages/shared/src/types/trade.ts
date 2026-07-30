import { OwnedPokemonDto } from './pokemon';
import { TrainerSaveDto } from './trainer';

export enum TradeListingStatus {
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum TradeOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED'
}

export interface TradeOfferDto {
  readonly id: string;
  readonly listingId: string;
  readonly bidderId: string;
  readonly status: TradeOfferStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly bidder?: Partial<TrainerSaveDto> & { user: { username: string } };
  readonly offeredPokemon: {
    readonly id: string;
    readonly pokemon: OwnedPokemonDto;
  }[];
}

export interface TradeListingDto {
  readonly id: string;
  readonly sellerId: string;
  readonly pokemonId: string;
  readonly description: string | null;
  readonly status: TradeListingStatus;
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly seller?: Partial<TrainerSaveDto> & { user: { username: string } };
  readonly pokemon: OwnedPokemonDto;
  readonly offers?: TradeOfferDto[];
}
