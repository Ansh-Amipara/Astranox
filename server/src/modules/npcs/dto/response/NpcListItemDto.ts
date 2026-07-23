export type NpcListItemDto = Readonly<{
  id: string;
  name: string;
  trainerClass: string | null;
  spriteUrl: string | null;
  rewardAstralCoins: number;
  rewardInfinityCoins: number;
  rewardVoidCoins: number;
  isDefeated: boolean;
}>;
