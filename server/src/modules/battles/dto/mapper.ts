import type { AvailableSpeciesDto } from './response/AvailableSpeciesDto';
import type { BattleSessionDto } from './response/BattleSessionDto';
import type { StartEncounterResultDto } from './response/StartEncounterResultDto';
import type { TurnResultDto } from './response/TurnResultDto';

export class BattleMapper {
  static toAvailableSpeciesDto(entity: any): AvailableSpeciesDto {
    return {
      id: entity.id,
      name: entity.name,
      spriteUrl: entity.spriteUrl,
    };
  }

  static toAvailableSpeciesDtoList(entities: any[]): AvailableSpeciesDto[] {
    return entities.map(BattleMapper.toAvailableSpeciesDto);
  }

  static toBattleSessionDto(entity: any): BattleSessionDto {
    return {
      id: entity.id,
      trainerId: entity.trainerId,
      status: entity.status,
      battleType: entity.battleType,
      turnNumber: entity.turnNumber,
      playerActivePokemonId: entity.playerActivePokemonId,
      npcTrainerId: entity.npcTrainerId,
      opponentPokemonData: entity.opponentPokemonData,
      opponentPartyData: entity.opponentPartyData,
      playerPokemonData: entity.playerPokemonData,
      playerPartyData: entity.playerPartyData,
      log: entity.log,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toStartEncounterResultDto(result: any): StartEncounterResultDto {
    return {
      encounter: result.encounter,
      npcTrainer: result.npcTrainer,
      battleSession: BattleMapper.toBattleSessionDto(result.battleSession),
    };
  }

  static toTurnResultDto(result: any): TurnResultDto {
    return {
      status: result.status,
      turnNumber: result.turnNumber,
      events: result.events,
      p1State: result.p1State,
      p2State: result.p2State,
    };
  }
}
