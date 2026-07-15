export type AddPokemonDto = Readonly<{
  speciesId: number;
  level: number;
  ivs?: {
    ivHp?: number;
    ivAttack?: number;
    ivDefense?: number;
    ivSpAtk?: number;
    ivSpDef?: number;
    ivSpeed?: number;
  };
}>;
