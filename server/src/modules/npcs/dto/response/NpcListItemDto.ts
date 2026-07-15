export type NpcListItemDto = Readonly<{
  id: string;
  name: string;
  trainerClass: string | null;
  spriteUrl: string | null;
  rewardMoney: number;
  isDefeated: boolean;
}>;
