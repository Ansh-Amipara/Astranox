import type { SpeciesDto } from './SpeciesDto';
import type { BattleSessionDto } from './BattleSessionDto';

export interface CustomEncounterResultDto {
  readonly encounter: {
    readonly species: SpeciesDto;
    readonly level: number;
  };
  readonly battleSession: BattleSessionDto;
}
