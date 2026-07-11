import { PrismaClient, TrainerSave } from '@prisma/client';

const prisma = new PrismaClient();

export class TrainersRepository {
  async findByUserId(userId: string): Promise<any> {
    return prisma.trainerSave.findUnique({
      where: { userId },
      include: {
        party: {
          where: { isParty: true },
          orderBy: { position: 'asc' },
          include: { 
            species: { include: { type1: true, type2: true } },
            moves: { include: { move: true } }
          }
        },
        inventory: {
          include: { item: true }
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
          include: { 
            species: { include: { type1: true, type2: true } },
            moves: { include: { move: true } }
          }
        },
        inventory: {
          include: { item: true }
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

      const learnset = await tx.learnset.findMany({
        where: { speciesId, level: { lte: 5 } },
        orderBy: [{ level: 'asc' }, { learnOrder: 'asc' }]
      });

      const uniqueMoves: any[] = [];
      const seen = new Set();
      for (let i = learnset.length - 1; i >= 0; i--) {
        if (!seen.has(learnset[i].moveId)) {
          seen.add(learnset[i].moveId);
          uniqueMoves.unshift(learnset[i]);
        }
      }

      const latestMoves = uniqueMoves.slice(-4);
      if (latestMoves.length > 0) {
        await tx.ownedPokemonMove.createMany({
          data: latestMoves.map((m: any, i: number) => ({
            ownedPokemonId: starter.id,
            moveId: m.moveId,
            slot: i
          }))
        });
      }

      const save = await tx.trainerSave.update({
        where: { id: trainerId },
        data: { starterChosenAt: new Date() },
        include: {
          party: {
            where: { isParty: true },
            orderBy: { position: 'asc' },
            include: { 
              species: { include: { type1: true, type2: true } },
              moves: { include: { move: true } }
            }
          },
          inventory: {
            include: { item: true }
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
      include: { 
        species: { include: { type1: true, type2: true } },
        moves: { include: { move: true } }
      }
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

  async getAllMoves() {
    return prisma.move.findMany({
      orderBy: { name: 'asc' },
      select: {
        name: true,
        type: { select: { name: true } },
        power: true,
        accuracy: true,
        damageClass: true
      }
    });
  }

  async changeMoves(trainerId: string, pokemonId: string, moveIds: number[]) {
    // Ensure the pokemon belongs to the trainer
    const pokemon = await prisma.ownedPokemon.findFirst({
      where: { id: pokemonId, trainerId }
    });

    if (!pokemon) return null;

    return prisma.$transaction(async (tx) => {
      await tx.ownedPokemonMove.deleteMany({
        where: { ownedPokemonId: pokemonId }
      });

      if (moveIds.length > 0) {
        await tx.ownedPokemonMove.createMany({
          data: moveIds.map((moveId, i) => ({
            ownedPokemonId: pokemonId,
            moveId,
            slot: i
          }))
        });
      }

      return true;
    });
  }
}
