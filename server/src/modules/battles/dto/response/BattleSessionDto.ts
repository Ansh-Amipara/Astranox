export type BattleSessionDto = Readonly<{
  id: string;
  trainerId: string;
  status: string;
  battleType: string;
  turnNumber: number;
  playerActivePokemonId: string;
  npcTrainerId: string | null;
  opponentPokemonData: any;
  opponentPartyData: any[] | null;
  playerPokemonData: any;
  playerPartyData: any[] | null;
  log: any[] | null;
  createdAt: Date;
  updatedAt: Date;
}>;
