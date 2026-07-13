import { PrismaClient, FriendshipStatus } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../../common/errors/AppError';

const prisma = new PrismaClient();

export class SocialService {
  async searchUsers(query: string, currentUserId: string) {
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

    return users;
  }

  async getFriendsList(userId: string) {
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

    return friendships.map(f => {
      const isInitiator = f.userAId === userId;
      const otherUser = isInitiator ? f.userB : f.userA;
      return {
        friendshipId: f.id,
        status: f.status,
        isIncoming: !isInitiator && f.status === FriendshipStatus.PENDING,
        friend: {
          id: otherUser.id,
          username: otherUser.username,
          badges: otherUser.trainerSave?.badges || [],
          memberSince: otherUser.trainerSave?.createdAt
        }
      };
    });
  }

  async sendFriendRequest(userId: string, targetUsername: string) {
    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername }
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
      throw new ValidationError(`A friendship or pending request already exists with ${targetUsername}.`);
    }

    return prisma.friendship.create({
      data: {
        userAId: userId,
        userBId: targetUser.id,
        status: FriendshipStatus.PENDING
      }
    });
  }

  async acceptFriendRequest(userId: string, friendshipId: string) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) throw new NotFoundError('Friendship request not found.');
    if (friendship.userBId !== userId) throw new ForbiddenError('You can only accept requests sent to you.');
    if (friendship.status === FriendshipStatus.ACCEPTED) throw new ValidationError('Friendship is already accepted.');

    return prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED }
    });
  }
}
