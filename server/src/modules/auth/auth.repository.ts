import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';

const prisma = new PrismaClient();

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
}

