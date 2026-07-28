import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExploreRepository {
  async addAstralCoins(trainerId: string, amount: number) {
    return prisma.trainerSave.update({
      where: { id: trainerId },
      data: {
        astralCoins: { increment: amount }
      }
    });
  }
}
