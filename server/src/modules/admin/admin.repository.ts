import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminRepository {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        trainerSave: {
          include: {
            party: {
              where: { isParty: true },
              include: { species: { select: { name: true } } }
            },
            _count: {
              select: { party: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addMoney(userId: string, amount: number) {
    const save = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) return null;

    return prisma.trainerSave.update({
      where: { id: save.id },
      data: {
        money: { increment: amount }
      }
    });
  }

  async getAllSpecies() {
    return prisma.species.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' }
    });
  }

  async getUserPokemon(userId: string) {
    return prisma.ownedPokemon.findMany({
      where: { 
        trainer: { userId } 
      },
      include: {
        species: true
      },
      orderBy: [
        { isParty: 'desc' },
        { position: 'asc' }
      ]
    });
  }


  async addPokemon(userId: string, speciesId: number, level: number, ivs?: any) {
    const save = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) return null;

    // Check if party is full
    const partyCount = await prisma.ownedPokemon.count({
      where: { trainerId: save.id, isParty: true }
    });

    const isParty = partyCount < 6;
    let boxNumber = null;
    let position = partyCount; // Append to end of party if < 6

    if (!isParty) {
      // Find first available box slot
      // We assume 32 boxes, 30 slots each
      // Just pick box 0 for now and find next available position
      const boxPokemon = await prisma.ownedPokemon.findMany({
        where: { trainerId: save.id, isParty: false },
        orderBy: [{ boxNumber: 'asc' }, { position: 'asc' }]
      });

      // Simple implementation: put it in Box 0 at next position
      // A more robust implementation would search for an empty slot.
      boxNumber = 0;
      position = boxPokemon.filter(p => p.boxNumber === 0).length;
    }

    return prisma.ownedPokemon.create({
      data: {
        trainerId: save.id,
        speciesId,
        level,
        isParty,
        boxNumber,
        position,
        ivHp: ivs?.hp ?? Math.floor(Math.random() * 32),
        ivAttack: ivs?.attack ?? Math.floor(Math.random() * 32),
        ivDefense: ivs?.defense ?? Math.floor(Math.random() * 32),
        ivSpAtk: ivs?.spAtk ?? Math.floor(Math.random() * 32),
        ivSpDef: ivs?.spDef ?? Math.floor(Math.random() * 32),
        ivSpeed: ivs?.speed ?? Math.floor(Math.random() * 32)
      },
      include: {
        species: true
      }
    });
  }
}
