export interface NpcDto {
  readonly id: string;
  readonly name: string;
  readonly spriteUrl: string | null;
  readonly trainerClass: string | null;
  readonly rewardMoney: number;
  readonly isDefeated: boolean;
  readonly region: string;
  readonly trainerType: string;
  readonly badgeName: string | null;
  readonly party: any[];
}
