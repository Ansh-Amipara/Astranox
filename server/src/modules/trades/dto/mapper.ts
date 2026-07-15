import type { TradeRequestDto } from './response/TradeRequestDto';
import { TrainerMapper } from '../../trainers/dto/mapper';

export class TradeMapper {
  static toTradeRequestDto(entity: any): TradeRequestDto {
    return {
      id: entity.id,
      initiatorId: entity.initiatorId,
      initiatorUsername: entity.initiator?.user?.username || null,
      receiverId: entity.receiverId,
      receiverUsername: entity.receiver?.user?.username || null,
      offeredPokemon: entity.offeredPokemon ? TrainerMapper.toPokemonSummaryDto(entity.offeredPokemon) : null,
      requestedPokemon: entity.requestedPokemon ? TrainerMapper.toPokemonSummaryDto(entity.requestedPokemon) : null,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toTradeRequestDtoList(entities: any[]): TradeRequestDto[] {
    return entities.map(TradeMapper.toTradeRequestDto);
  }
}
