import type { TrainerSaveDto, InventoryItemDto } from './response/TrainerSaveDto';
import type { OwnedPokemonDto, PokemonSummaryDto } from './response/OwnedPokemonDto';
import type { MoveDto, PokemonEquippedMovesDto } from './response/MoveDto';
import { calculatePokemonCP } from '../../../game/instance/cp';

export class TrainerMapper {
  static toTrainerSaveDto(entity: any): TrainerSaveDto {
    return {
      id: entity.id,
      userId: entity.userId,
      astralCoins: entity.astralCoins,
      infinityCoins: entity.infinityCoins,
      storedXp: entity.storedXp || 0,
      rank: entity.rank,
      starterChosenAt: entity.starterChosenAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      party: Array.isArray(entity.party) ? entity.party.map(TrainerMapper.toOwnedPokemonDto) : [],
      inventory: Array.isArray(entity.inventory) ? entity.inventory.map(TrainerMapper.toInventoryItemDto) : [],
      unlockedMoves: Array.isArray(entity.unlockedMoves) ? entity.unlockedMoves.map((m: any) => m.moveId) : [],
      unlockedForms: Array.isArray(entity.unlockedForms) ? entity.unlockedForms : [],
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

    const cp = calculatePokemonCP(
      {
        hp: entity.species?.hp || 0,
        attack: entity.species?.attack || 0,
        defense: entity.species?.defense || 0,
        spAtk: entity.species?.spAtk || 0,
        spDef: entity.species?.spDef || 0,
        speed: entity.species?.speed || 0,
      },
      {
        hp: entity.ivHp || 0,
        attack: entity.ivAttack || 0,
        defense: entity.ivDefense || 0,
        spAtk: entity.ivSpAtk || 0,
        spDef: entity.ivSpDef || 0,
        speed: entity.ivSpeed || 0,
      },
      entity.level || 1,
      entity.potential || 'G',
      entity.species?.isGmax || false,
      Array.isArray(entity.equippedMoves) ? entity.equippedMoves.map((m: any) => m.move?.power || 0) : []
    );

    return {
      id: entity.id,
      speciesId: entity.speciesId,
      speciesName: entity.species?.name || 'Unknown',
      types,
      level: entity.level,
      cp,
      potential: entity.potential,
      currentXp: entity.currentXp,
      isParty: entity.isParty,
      position: entity.position,

      ivHp: entity.ivHp,
      ivAttack: entity.ivAttack,
      ivDefense: entity.ivDefense,
      ivSpAtk: entity.ivSpAtk,
      ivSpDef: entity.ivSpDef,
      ivSpeed: entity.ivSpeed,
      equippedMoves: Array.isArray(entity.equippedMoves) ? entity.equippedMoves.map(TrainerMapper.toPokemonEquippedMovesDto) : [],
      species: {
        id: entity.species?.id,
        name: entity.species?.name,
        spriteUrl: entity.species?.spriteUrl || null,
        type1: entity.species?.type1 ? { name: entity.species.type1.name } : undefined,
        type2: entity.species?.type2 ? { name: entity.species.type2.name } : undefined,
        evolvesTo: Array.isArray(entity.species?.evolvesTo) ? entity.species.evolvesTo.map((e: any) => ({ name: e.name, id: e.id })) : [],
        evolutionLevel: entity.species?.evolutionLevel,
        evolveByBattle: entity.species?.evolveByBattle || false,
        megaEvolvesToIds: entity.species?.megaEvolvesToIds || [],
        gmaxEvolvesToIds: entity.species?.gmaxEvolvesToIds || [],
        hp: entity.species?.hp || 0,
        attack: entity.species?.attack || 0,
        defense: entity.species?.defense || 0,
        spAtk: entity.species?.spAtk || 0,
        spDef: entity.species?.spDef || 0,
        speed: entity.species?.speed || 0,
        isMega: entity.species?.isMega || false,
        isGmax: entity.species?.isGmax || false,
      }
    };
  }

  static toPokemonSummaryDto(entity: any): PokemonSummaryDto {
    const types = [];
    if (entity.species?.type1?.name) types.push(entity.species.type1.name);
    if (entity.species?.type2?.name) types.push(entity.species.type2.name);

    const cp = calculatePokemonCP(
      {
        hp: entity.species?.hp || 0,
        attack: entity.species?.attack || 0,
        defense: entity.species?.defense || 0,
        spAtk: entity.species?.spAtk || 0,
        spDef: entity.species?.spDef || 0,
        speed: entity.species?.speed || 0,
      },
      {
        hp: entity.ivHp || 0,
        attack: entity.ivAttack || 0,
        defense: entity.ivDefense || 0,
        spAtk: entity.ivSpAtk || 0,
        spDef: entity.ivSpDef || 0,
        speed: entity.ivSpeed || 0,
      },
      entity.level || 1,
      entity.potential || 'G',
      entity.species?.isGmax || false,
      Array.isArray(entity.equippedMoves) ? entity.equippedMoves.map((m: any) => m.move?.power || 0) : []
    );

    return {
      id: entity.id,
      speciesId: entity.speciesId,
      speciesName: entity.species?.name || 'Unknown',
      spriteUrl: entity.species?.spriteUrl || null,
      level: entity.level,
      cp,
      potential: entity.potential,
      types,
      isParty: entity.isParty,

      position: entity.position,
    };
  }

  static toPokemonSummaryList(entities: any[]): PokemonSummaryDto[] {
    return entities.map(TrainerMapper.toPokemonSummaryDto);
  }

  static toPokemonEquippedMovesDto(entity: any): PokemonEquippedMovesDto {
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
      
      damageClass: entity.damageClass,
    };
  }

  static toMoveDtoList(entities: any[]): MoveDto[] {
    return entities.map(TrainerMapper.toMoveDto);
  }
}
