import type { NpcDto } from './response/NpcDto';

export class NpcMapper {
  static toNpcDto(entity: any): NpcDto {
    return {
      id: entity.id,
      name: entity.name,
      spriteUrl: entity.spriteUrl,
      trainerClass: entity.trainerClass,
      rewardAstralCoins: entity.rewardAstralCoins,
      rewardInfinityCoins: entity.rewardInfinityCoins,
      rewardVoidCoins: entity.rewardVoidCoins,
      isDefeated: !!entity.isDefeated,
      region: entity.region,
      trainerType: entity.trainerType,
      badgeName: entity.badgeName || null,
      party: entity.party || [],
    };
  }
}
