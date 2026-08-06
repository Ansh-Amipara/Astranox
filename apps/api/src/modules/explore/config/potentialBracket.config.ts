import { TrainerRank, PokemonPotential } from '@prisma/client';

export type PotentialBracket = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS' | 'EX';

export const BRACKET_ORDER: PotentialBracket[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'EX'];

export const BRACKET_OFFSET = 4;

export const TRAINER_RANK_TO_BRACKET: Record<TrainerRank, PotentialBracket> = {
  [TrainerRank.F_MINUS]: 'F',
  [TrainerRank.F]: 'F',
  [TrainerRank.F_PLUS]: 'F',
  
  [TrainerRank.E_MINUS]: 'E',
  [TrainerRank.E]: 'E',
  [TrainerRank.E_PLUS]: 'E',
  
  [TrainerRank.D_MINUS]: 'D',
  [TrainerRank.D]: 'D',
  [TrainerRank.D_PLUS]: 'D',
  
  [TrainerRank.C_MINUS]: 'C',
  [TrainerRank.C]: 'C',
  [TrainerRank.C_PLUS]: 'C',
  
  [TrainerRank.B_MINUS]: 'B',
  [TrainerRank.B]: 'B',
  [TrainerRank.B_PLUS]: 'B',
  
  [TrainerRank.A_MINUS]: 'A',
  [TrainerRank.A]: 'A',
  [TrainerRank.A_PLUS]: 'A',
  
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
  'F': [PokemonPotential.F_MINUS, PokemonPotential.F, PokemonPotential.F_PLUS],
  'E': [PokemonPotential.E_MINUS, PokemonPotential.E, PokemonPotential.E_PLUS],
  'D': [PokemonPotential.D_MINUS, PokemonPotential.D, PokemonPotential.D_PLUS],
  'C': [PokemonPotential.C_MINUS, PokemonPotential.C, PokemonPotential.C_PLUS],
  'B': [PokemonPotential.B_MINUS, PokemonPotential.B, PokemonPotential.B_PLUS],
  'A': [PokemonPotential.A_MINUS, PokemonPotential.A, PokemonPotential.A_PLUS],
  'S': [PokemonPotential.S_MINUS, PokemonPotential.S, PokemonPotential.S_PLUS],
  'SS': [PokemonPotential.SS_MINUS, PokemonPotential.SS, PokemonPotential.SS_PLUS],
  'SSS': [PokemonPotential.SSS_MINUS, PokemonPotential.SSS, PokemonPotential.SSS_PLUS],
  'EX': [PokemonPotential.EX_MINUS, PokemonPotential.EX, PokemonPotential.EX_PLUS],
};
