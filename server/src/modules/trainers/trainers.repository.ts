import { PrismaClient, TrainerSave, OwnedPokemon } from '@prisma/client';

const prisma = new PrismaClient();

export class TrainersRepository {
  async findByUserId(userId: string): Promise<TrainerSave | null> {
    return prisma.trainerSave.findUnique({
      where: { userId },
      include: {
        party: {
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
          include: { species: true }
        }
      }
    });
  }

  async setStarter(trainerId: string, speciesId: number): Promise<TrainerSave> {
    return prisma.$transaction(async (tx) => {
      // Create the level 5 starter Pokemon
      const starter = await tx.ownedPokemon.create({
        data: {
          trainerId,
          speciesId,
          level: 5,
          // Random IVs 0-31
          ivHp: Math.floor(Math.random() * 32),
          ivAttack: Math.floor(Math.random() * 32),
          ivDefense: Math.floor(Math.random() * 32),
          ivSpAtk: Math.floor(Math.random() * 32),
          ivSpDef: Math.floor(Math.random() * 32),
          ivSpeed: Math.floor(Math.random() * 32),
        }
      });

      // Update trainer save
      const save = await tx.trainerSave.update({
        where: { id: trainerId },
        data: { starterChosenAt: new Date() },
        include: {
          party: {
            include: { species: true }
          }
        }
      });

      return save;
    });
  }
}
