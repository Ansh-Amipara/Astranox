import { TrainerRank, PokemonPotential } from '@prisma/client';

export type PotentialBracket = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS' | 'EX';

export const BRACKET_ORDER: PotentialBracket[] = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'EX'];

export const BRACKET_OFFSET = 4;

export const TRAINER_RANK_TO_BRACKET: Record<TrainerRank, PotentialBracket> = {
  [TrainerRank.G]: 'G',
  [TrainerRank.F]: 'F',
  [TrainerRank.E]: 'E',
  [TrainerRank.D]: 'D',
  [TrainerRank.C]: 'C',
  [TrainerRank.B]: 'B',
  [TrainerRank.A]: 'A',
  
  [TrainerRank.S_MINUS]: 'S',
  [TrainerRank.S]: 'S',
  [TrainerRank.S_PLUS]: 'S',
  
  [TrainerRank.SS_MINUS]: 'SS',
  [TrainerRank.SS]: 'SS',
  [TrainerRank.SS_PLUS]: 'SS',
  
  [TrainerRank.SSS_MINUS]: 'SSS',
  [TrainerRank.SSS]: 'SSS',
  [TrainerRank.SSS_PLUS]: 'SSS',
  
  [TrainerRank.EX_MINUS]: 'EX',
  [TrainerRank.EX]: 'EX',
  [TrainerRank.EX_PLUS]: 'EX',
};

export const BRACKET_POTENTIALS: Record<PotentialBracket, PokemonPotential[]> = {
  'G': [PokemonPotential.G],
  'F': [PokemonPotential.F],
  'E': [PokemonPotential.E],
  'D': [PokemonPotential.D],
  'C': [PokemonPotential.C],
  'B': [PokemonPotential.B],
  'A': [PokemonPotential.A],
  'S': [PokemonPotential.S_MINUS, PokemonPotential.S, PokemonPotential.S_PLUS],
  'SS': [PokemonPotential.SS_MINUS, PokemonPotential.SS, PokemonPotential.SS_PLUS],
  'SSS': [PokemonPotential.SSS_MINUS, PokemonPotential.SSS, PokemonPotential.SSS_PLUS],
  'EX': [PokemonPotential.EX_MINUS, PokemonPotential.EX, PokemonPotential.EX_PLUS],
};
