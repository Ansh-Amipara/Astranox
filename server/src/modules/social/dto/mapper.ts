import type { UserSearchResultDto } from './response/UserSearchResultDto';
import type { FriendshipDto, BaseFriendshipDto } from './response/FriendshipDto';

export class SocialMapper {
  static toUserSearchResultDto(entity: any): UserSearchResultDto {
    return {
      id: entity.id,
      username: entity.username,
      badges: entity.trainerSave?.badges || [],
      memberSince: entity.trainerSave?.createdAt || null,
    };
  }

  static toUserSearchResultDtoList(entities: any[]): UserSearchResultDto[] {
    return entities.map(SocialMapper.toUserSearchResultDto);
  }

  static toFriendshipDto(f: any, currentUserId: string): FriendshipDto {
    const isInitiator = f.userAId === currentUserId;
    const otherUser = isInitiator ? f.userB : f.userA;
    return {
      friendshipId: f.id,
      status: f.status,
      isIncoming: !isInitiator && f.status === 'PENDING',
      friend: {
        id: otherUser.id,
        username: otherUser.username,
        badges: otherUser.trainerSave?.badges || [],
        memberSince: otherUser.trainerSave?.createdAt || null,
      },
    };
  }

  static toFriendshipDtoList(entities: any[], currentUserId: string): FriendshipDto[] {
    return entities.map(f => SocialMapper.toFriendshipDto(f, currentUserId));
  }

  static toBaseFriendshipDto(entity: any): BaseFriendshipDto {
    return {
      id: entity.id,
      userAId: entity.userAId,
      userBId: entity.userBId,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
