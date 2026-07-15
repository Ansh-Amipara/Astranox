import { PrismaClient, FriendshipStatus } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../../common/errors/AppError';
import { SocialMapper } from './dto/mapper';
import type { UserSearchResultDto } from './dto/response/UserSearchResultDto';
import type { FriendshipDto, BaseFriendshipDto } from './dto/response/FriendshipDto';
import type { SendFriendRequestDto } from './dto/request/SendFriendRequestDto';

const prisma = new PrismaClient();

export class SocialService {
  async searchUsers(query: string, currentUserId: string): Promise<UserSearchResultDto[]> {
    if (!query || query.length < 3) {
      return [];
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive'
        },
        id: { not: currentUserId }
      },
      select: {
        id: true,
        username: true,
        trainerSave: {
          select: {
            badges: true,
            createdAt: true
          }
        }
      },
      take: 10
    });

    return SocialMapper.toUserSearchResultDtoList(users);
  }

  async getFriendsList(userId: string): Promise<FriendshipDto[]> {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: {
        userA: { select: { id: true, username: true, trainerSave: { select: { badges: true, money: true, createdAt: true } } } },
        userB: { select: { id: true, username: true, trainerSave: { select: { badges: true, money: true, createdAt: true } } } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return SocialMapper.toFriendshipDtoList(friendships, userId);
  }

  async sendFriendRequest(userId: string, dto: SendFriendRequestDto): Promise<BaseFriendshipDto> {
    const targetUser = await prisma.user.findUnique({
      where: { username: dto.username }
    });

    if (!targetUser) throw new NotFoundError('User not found.');
    if (targetUser.id === userId) throw new ValidationError('You cannot send a friend request to yourself.');

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: targetUser.id },
          { userAId: targetUser.id, userBId: userId }
        ]
      }
    });

    if (existing) {
      throw new ValidationError(`A friendship or pending request already exists with ${dto.username}.`);
    }

    const friendship = await prisma.friendship.create({
      data: {
        userAId: userId,
        userBId: targetUser.id,
        status: FriendshipStatus.PENDING
      }
    });
    
    return SocialMapper.toBaseFriendshipDto(friendship);
  }

  async acceptFriendRequest(userId: string, friendshipId: string): Promise<BaseFriendshipDto> {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) throw new NotFoundError('Friendship request not found.');
    if (friendship.userBId !== userId) throw new ForbiddenError('You can only accept requests sent to you.');
    if (friendship.status === FriendshipStatus.ACCEPTED) throw new ValidationError('Friendship is already accepted.');

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED }
    });

    return SocialMapper.toBaseFriendshipDto(updated);
  }
}
