import { injectable } from 'tsyringe';
import type { User, RefreshToken } from '@prisma/client';
import { prisma } from '../../core/db/prisma';

@injectable()
export class AuthRepository {
  async createUser(data: any): Promise<User> {
    return prisma.user.create({ data });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateRefreshToken(id: string, refreshTokenHash: string | null): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }

  async updateProfile(id: string, data: { username: string }): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ip?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        ...data,
        revokedAt: null,
      },
    });
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<(RefreshToken & { user: User }) | null> {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshToken(id: string, replacedBy?: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        replacedBy,
      },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<{ count: number }> {
    let retries = 3;
    while (retries > 0) {
      try {
        return await prisma.refreshToken.updateMany({
          where: {
            userId,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return { count: 0 };
  }
}
