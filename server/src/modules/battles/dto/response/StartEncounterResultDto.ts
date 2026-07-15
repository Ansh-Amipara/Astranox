import type { BattleSessionDto } from './BattleSessionDto';

export type StartEncounterResultDto = Readonly<{
  encounter?: {
    species: any;
    level: number;
  };
  npcTrainer?: {
    id: string;
    name: string;
    spriteUrl: string | null;
    trainerClass: string | null;
  };
  battleSession: BattleSessionDto;
}>;
