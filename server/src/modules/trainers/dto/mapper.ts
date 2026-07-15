import type { TrainerSaveDto, InventoryItemDto } from './response/TrainerSaveDto';
import type { OwnedPokemonDto, PokemonSummaryDto } from './response/OwnedPokemonDto';
import type { MoveDto, OwnedPokemonMoveDto } from './response/MoveDto';

export class TrainerMapper {
  static toTrainerSaveDto(entity: any): TrainerSaveDto {
    return {
      id: entity.id,
      userId: entity.userId,
      money: entity.money,
      starterChosenAt: entity.starterChosenAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      party: Array.isArray(entity.party) ? entity.party.map(TrainerMapper.toOwnedPokemonDto) : [],
      inventory: Array.isArray(entity.inventory) ? entity.inventory.map(TrainerMapper.toInventoryItemDto) : [],
    };
  }

  static toInventoryItemDto(entity: any): InventoryItemDto {
    return {
      itemId: entity.itemId,
      quantity: entity.quantity,
      item: {
        name: entity.item?.name || 'Unknown Item',
        description: entity.item?.description || 'No description',
        spriteUrl: entity.item?.spriteUrl || null,
        category: entity.item?.category || 'misc',
      }
    };
  }

  static toOwnedPokemonDto(entity: any): OwnedPokemonDto {
    const types = [];
    if (entity.species?.type1?.name) types.push(entity.species.type1.name);
    if (entity.species?.type2?.name) types.push(entity.species.type2.name);

    return {
      id: entity.id,
      speciesId: entity.speciesId,
      speciesName: entity.species?.name || 'Unknown',
      types,
      level: entity.level,
      currentXp: entity.currentXp,
      isParty: entity.isParty,
      position: entity.position,
      boxNumber: entity.boxNumber,
      ivHp: entity.ivHp,
      ivAttack: entity.ivAttack,
      ivDefense: entity.ivDefense,
      ivSpAtk: entity.ivSpAtk,
      ivSpDef: entity.ivSpDef,
      ivSpeed: entity.ivSpeed,
      moves: Array.isArray(entity.moves) ? entity.moves.map(TrainerMapper.toOwnedPokemonMoveDto) : [],
      species: {
        hp: entity.species?.hp || 0,
        attack: entity.species?.attack || 0,
        defense: entity.species?.defense || 0,
        spAtk: entity.species?.spAtk || 0,
        spDef: entity.species?.spDef || 0,
        speed: entity.species?.speed || 0,
      }
    };
  }

  static toPokemonSummaryDto(entity: any): PokemonSummaryDto {
    const types = [];
    if (entity.species?.type1?.name) types.push(entity.species.type1.name);
    if (entity.species?.type2?.name) types.push(entity.species.type2.name);

    return {
      id: entity.id,
      speciesId: entity.speciesId,
      speciesName: entity.species?.name || 'Unknown',
      level: entity.level,
      types,
      isParty: entity.isParty,
      boxNumber: entity.boxNumber,
      position: entity.position,
    };
  }

  static toPokemonSummaryList(entities: any[]): PokemonSummaryDto[] {
    return entities.map(TrainerMapper.toPokemonSummaryDto);
  }

  static toOwnedPokemonMoveDto(entity: any): OwnedPokemonMoveDto {
    return {
      moveId: entity.moveId,
      slot: entity.slot,
      move: TrainerMapper.toMoveDto(entity.move),
    };
  }

  static toMoveDto(entity: any): MoveDto {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type?.name || 'normal',
      power: entity.power,
      accuracy: entity.accuracy,
      damageClass: entity.damageClass,
    };
  }

  static toMoveDtoList(entities: any[]): MoveDto[] {
    return entities.map(TrainerMapper.toMoveDto);
  }
}
