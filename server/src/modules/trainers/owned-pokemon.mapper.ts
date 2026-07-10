import { OwnedPokemon, Species, Type } from '@prisma/client';
import { PokemonInstance, SpeciesContext } from '../../game/instance/types';
import { createPokemonInstance } from '../../game/instance/PokemonInstance';

// Prisma's generated type for an OwnedPokemon that includes its Species and Types relation
type OwnedPokemonWithRelations = OwnedPokemon & {
  species: Species & {
    type1: Type;
    type2: Type | null;
  };
};

/**
 * Maps a Prisma OwnedPokemon database row into a pure, combat-ready PokemonInstance.
 * This bridges the database to the pure Domain layer.
 */
export function mapOwnedPokemonToInstance(dbModel: OwnedPokemonWithRelations): PokemonInstance {
  
  // 1. Construct Species Context
  const types = [dbModel.species.type1.name];
  if (dbModel.species.type2) {
    types.push(dbModel.species.type2.name);
  }

  const speciesContext: SpeciesContext = {
    id: dbModel.species.id,
    name: dbModel.species.name,
    types: types,
    baseStats: {
      hp: dbModel.species.hp,
      attack: dbModel.species.attack,
      defense: dbModel.species.defense,
      spAtk: dbModel.species.spAtk,
      spDef: dbModel.species.spDef,
      speed: dbModel.species.speed,
    },
    catchRate: dbModel.species.catchRate,
    baseExp: dbModel.species.baseExp,
  };

  // 2. Hydrate via Pure Factory
  return createPokemonInstance({
    id: dbModel.id,
    nickname: dbModel.nickname,
    level: dbModel.level,
    currentXp: dbModel.currentXp,
    ivs: {
      hp: dbModel.ivHp,
      attack: dbModel.ivAttack,
      defense: dbModel.ivDefense,
      spAtk: dbModel.ivSpAtk,
      spDef: dbModel.ivSpDef,
      speed: dbModel.ivSpeed,
    },
    species: speciesContext
  });
}
