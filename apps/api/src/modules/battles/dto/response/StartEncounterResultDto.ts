import type { BattleSessionDto } from './BattleSessionDto';

export type StartEncounterResultDto = Readonly<{
  encounter?: {
    species: any;
    level: number;
  };
  battleSession: BattleSessionDto;
}>;
