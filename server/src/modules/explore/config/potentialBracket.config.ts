import { TrainerRank, PokemonPotential } from '@prisma/client';

export type PotentialBracket = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export const BRACKET_ORDER: PotentialBracket[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

export const BRACKET_OFFSET = 4;

export const TRAINER_RANK_TO_BRACKET: Record<TrainerRank, PotentialBracket> = {
  [TrainerRank.NO_RANK]: 'F',
  [TrainerRank.F_RANK]: 'F',
  [TrainerRank.E_RANK]: 'E',
  [TrainerRank.D_RANK]: 'D',
  [TrainerRank.C_RANK]: 'C',
  [TrainerRank.B_RANK]: 'B',
  [TrainerRank.A_RANK]: 'A',
  [TrainerRank.S_MINUS_RANK]: 'S',
  [TrainerRank.S_RANK]: 'S',
  [TrainerRank.S_PLUS_RANK]: 'S',
  [TrainerRank.SS_MINUS_RANK]: 'SS',
  [TrainerRank.SS_RANK]: 'SS',
  [TrainerRank.SS_PLUS_RANK]: 'SS',
  [TrainerRank.SSS_MINUS_RANK]: 'SSS',
  [TrainerRank.SSS_RANK]: 'SSS',
  [TrainerRank.SSS_PLUS_RANK]: 'SSS',
};

export const BRACKET_POTENTIALS: Record<PotentialBracket, PokemonPotential[]> = {
  'F': [PokemonPotential.BLACK_IRON, PokemonPotential.BRONZE],
  'E': [PokemonPotential.SILVER, PokemonPotential.GOLD],
  'D': [PokemonPotential.PLATINUM, PokemonPotential.ADAMANTITE],
  'C': [PokemonPotential.DIAMOND, PokemonPotential.CRYSTAL],
  'B': [PokemonPotential.EPIC, PokemonPotential.HEROIC],
  'A': [PokemonPotential.SOVEREIGN, PokemonPotential.LEGENDARY],
  'S': [PokemonPotential.DIVINE, PokemonPotential.CELESTIAL],
  'SS': [PokemonPotential.PRIMORDIAL, PokemonPotential.MYTHICAL],
  'SSS': [PokemonPotential.INFINITY, PokemonPotential.ETERNAL],
};
