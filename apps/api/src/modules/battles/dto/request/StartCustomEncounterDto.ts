export type StartCustomEncounterDto = Readonly<{
  speciesId: number;
  level: number;
  battleType?: any; // BattleType enum from Prisma
}>;
