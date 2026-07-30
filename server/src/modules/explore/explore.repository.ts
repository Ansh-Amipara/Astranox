import { injectable } from 'tsyringe';

import { prisma } from '../../core/db/prisma';


@injectable()
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
