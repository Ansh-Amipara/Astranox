import { PokemonPotential } from '@prisma/client';

export type EditPokemonDto = Readonly<{
  potential?: PokemonPotential;
  addXp?: number;
  ivs?: {
    ivHp?: number;
    ivAttack?: number;
    ivDefense?: number;
    ivSpAtk?: number;
    ivSpDef?: number;
    ivSpeed?: number;
  };
}>;
