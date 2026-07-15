import type { PokemonSummaryDto } from '../../../trainers/dto/response/OwnedPokemonDto';

export interface TradeRequestDto {
  readonly id: string;
  readonly initiatorId: string;
  readonly initiatorUsername: string | null;
  readonly receiverId: string;
  readonly receiverUsername: string | null;
  readonly offeredPokemon: PokemonSummaryDto | null;
  readonly requestedPokemon: PokemonSummaryDto | null;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
