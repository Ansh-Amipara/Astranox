import { PrismaClient, TrainerSave, OwnedPokemon } from '@prisma/client';

const prisma = new PrismaClient();

export class TrainersRepository {
  async findByUserId(userId: string): Promise<TrainerSave | null> {
    return prisma.trainerSave.findUnique({
      where: { userId },
      include: {
        party: {
          where: { isParty: true },
          orderBy: { position: 'asc' },
          include: { species: true }
        }
      }
    });
  }

  async createTrainerSave(userId: string): Promise<TrainerSave> {
    return prisma.trainerSave.create({
      data: { userId },
      include: {
        party: {
          where: { isParty: true },
          orderBy: { position: 'asc' },
          include: { species: true }
        }
      }
    });
  }

  async setStarter(trainerId: string, speciesId: number): Promise<TrainerSave> {
    return prisma.$transaction(async (tx) => {
      const starter = await tx.ownedPokemon.create({
        data: {
          trainerId,
          speciesId,
          level: 5,
          isParty: true,
          position: 0,
          boxNumber: null,
          ivHp: Math.floor(Math.random() * 32),
          ivAttack: Math.floor(Math.random() * 32),
          ivDefense: Math.floor(Math.random() * 32),
          ivSpAtk: Math.floor(Math.random() * 32),
          ivSpDef: Math.floor(Math.random() * 32),
          ivSpeed: Math.floor(Math.random() * 32),
        }
      });

      const save = await tx.trainerSave.update({
        where: { id: trainerId },
        data: { starterChosenAt: new Date() },
        include: {
          party: {
            where: { isParty: true },
            orderBy: { position: 'asc' },
            include: { species: true }
          }
        }
      });

      return save;
    });
  }

  async getBox(trainerId: string, boxNumber: number) {
    return prisma.ownedPokemon.findMany({
      where: {
        trainerId,
        isParty: false,
        boxNumber,
      },
      orderBy: { position: 'asc' },
      include: { species: true }
    });
  }

  async swapSlots(
    trainerId: string,
    from: { isParty: boolean; boxNumber: number | null; position: number },
    to: { isParty: boolean; boxNumber: number | null; position: number }
  ) {
    return prisma.$transaction(async (tx) => {
      // Find both pokemon
      const fromPokemon = await tx.ownedPokemon.findFirst({
        where: { trainerId, isParty: from.isParty, boxNumber: from.boxNumber, position: from.position }
      });
      const toPokemon = await tx.ownedPokemon.findFirst({
        where: { trainerId, isParty: to.isParty, boxNumber: to.boxNumber, position: to.position }
      });

      if (fromPokemon) {
        await tx.ownedPokemon.update({
          where: { id: fromPokemon.id },
          data: { isParty: to.isParty, boxNumber: to.boxNumber, position: to.position }
        });
      }

      if (toPokemon) {
        await tx.ownedPokemon.update({
          where: { id: toPokemon.id },
          data: { isParty: from.isParty, boxNumber: from.boxNumber, position: from.position }
        });
      }

      return true;
    });
  }
}
