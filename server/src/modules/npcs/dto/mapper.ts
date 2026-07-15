import type { NpcDto } from './response/NpcDto';

export class NpcMapper {
  static toNpcDto(entity: any): NpcDto {
    return {
      id: entity.id,
      name: entity.name,
      spriteUrl: entity.spriteUrl,
      trainerClass: entity.trainerClass,
      rewardMoney: entity.rewardMoney,
      isDefeated: !!entity.isDefeated,
      region: entity.region,
      trainerType: entity.trainerType,
      badgeName: entity.badgeName || null,
      party: entity.party || [],
    };
  }
}
