import { PokemonPotential } from '@prisma/client';

export type AddPokemonDto = Readonly<{
  speciesId: number;
  level: number;
  potential: PokemonPotential;
  ivs?: {
    ivHp?: number;
    ivAttack?: number;
    ivDefense?: number;
    ivSpAtk?: number;
    ivSpDef?: number;
    ivSpeed?: number;
  };
}>;
