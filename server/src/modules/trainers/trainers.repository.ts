import { PrismaClient, TrainerSave, PokemonPotential } from '@prisma/client';

const prisma = new PrismaClient();

function generateStarterPotential() {
  const rand = Math.random();
  if (rand < 0.10) return 'DIAMOND';
  if (rand < 0.50) return 'PLATINUM'; // 40% chance (0.10 to 0.50)
  return 'GOLD'; // 50% chance (0.50 to 1.0)
}

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
            moves: { include: { move: { include: { type: true } } } }
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
            moves: { include: { move: { include: { type: true } } } }
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
          // @ts-ignore
          potential: generateStarterPotential() as any,
          currentXp: 5000,
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
              moves: { include: { move: { include: { type: true } } } }
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
        moves: { include: { move: { include: { type: true } } } }
      }
    });
  }

  async getAllPokemon(trainerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.ownedPokemon.findMany({
        where: { trainerId },
        orderBy: [{ isParty: 'desc' }, { level: 'desc' }],
        skip,
        take: limit,
        include: { 
          species: { include: { type1: true, type2: true } },
          moves: { include: { move: { include: { type: true } } } }
        }
      }),
      prisma.ownedPokemon.count({ where: { trainerId } })
    ]);
    return { data, total };
  }

  async removeFromParty(trainerId: string, pokemonId: string) {
    return prisma.$transaction(async (tx) => {
      const pokemon = await tx.ownedPokemon.findFirst({
        where: { id: pokemonId, trainerId, isParty: true }
      });
      if (!pokemon) throw new Error('Pokemon not found in party');

      const boxed = await tx.ownedPokemon.findMany({
        where: { trainerId, isParty: false },
        select: { boxNumber: true, position: true }
      });
      
      const occupied = new Set(boxed.map(p => `${p.boxNumber}-${p.position}`));
      let targetBox = null;
      let targetPos = null;
      
      for (let b = 0; b < 32; b++) {
        for (let p = 0; p < 30; p++) {
          if (!occupied.has(`${b}-${p}`)) {
            targetBox = b;
            targetPos = p;
            break;
          }
        }
        if (targetBox !== null) break;
      }
      
      if (targetBox === null) throw new Error('No PC Box space available');
      
      await tx.ownedPokemon.update({
        where: { id: pokemonId },
        data: { isParty: false, boxNumber: targetBox, position: targetPos }
      });
    });
  }

  async addToParty(trainerId: string, pokemonId: string, targetPosition: number) {
    return prisma.$transaction(async (tx) => {
      const fromPokemon = await tx.ownedPokemon.findFirst({
        where: { id: pokemonId, trainerId, isParty: false }
      });
      if (!fromPokemon) throw new Error('Pokemon not found in PC');

      const existingPartyPokemon = await tx.ownedPokemon.findFirst({
        where: { trainerId, isParty: true, position: targetPosition }
      });

      if (existingPartyPokemon) {
        await tx.ownedPokemon.update({
          where: { id: existingPartyPokemon.id },
          data: { isParty: false, boxNumber: fromPokemon.boxNumber as number, position: fromPokemon.position }
        });
      }

      await tx.ownedPokemon.update({
        where: { id: pokemonId },
        data: { isParty: true, boxNumber: null, position: targetPosition }
      });
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
        id: true,
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

  async releasePokemon(trainerId: string, pokemonId: string) {
    return prisma.ownedPokemon.deleteMany({
      where: {
        id: pokemonId,
        trainerId
      }
    });
  }

  async getPokemonById(trainerId: string, pokemonId: string) {
    return prisma.ownedPokemon.findFirst({
      where: { id: pokemonId, trainerId },
      include: {
        species: true,
        moves: { include: { move: true } }
      }
    });
  }

  async getInventoryItem(trainerId: string, itemId: string) {
    return prisma.inventoryItem.findUnique({
      where: {
        trainerId_itemId: { trainerId, itemId }
      }
    });
  }

  async evolvePokemon(trainerId: string, pokemonId: string, evolvesToId: number, itemIdToConsume?: string) {
    return prisma.$transaction(async (tx) => {
      if (itemIdToConsume) {
        const item = await tx.inventoryItem.findUnique({
          where: { trainerId_itemId: { trainerId, itemId: itemIdToConsume } }
        });
        if (!item || item.quantity <= 0) {
          throw new Error('Item not found or insufficient quantity');
        }
        await tx.inventoryItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity - 1 }
        });
      }

      return tx.ownedPokemon.update({
        where: { id: pokemonId },
        data: { speciesId: evolvesToId }
      });
    });
  }

  async boostPotential(trainerSaveId: string, pokemonId: string, nextPotential: PokemonPotential, itemIdToConsume: string) {
    const results = await prisma.$transaction([
      prisma.ownedPokemon.update({
        where: { id: pokemonId, trainerId: trainerSaveId },
        // @ts-ignore
        data: { potential: nextPotential },
        include: {
          species: { include: { type1: true, type2: true } },
          moves: { include: { move: { include: { type: true } } } }
        }
      }),
      prisma.inventoryItem.update({
        where: { trainerId_itemId: { trainerId: trainerSaveId, itemId: itemIdToConsume } },
        data: { quantity: { decrement: 1 } },
      }),
    ]);
    return results[0];
  }

  async boostIv(trainerSaveId: string, pokemonId: string, statName: string, newValue: number, itemIdToConsume: string) {
    const results = await prisma.$transaction([
      prisma.ownedPokemon.update({
        where: { id: pokemonId, trainerId: trainerSaveId },
        data: { [statName]: newValue },
        include: {
          species: { include: { type1: true, type2: true } },
          moves: { include: { move: { include: { type: true } } } }
        }
      }),
      prisma.inventoryItem.update({
        where: { trainerId_itemId: { trainerId: trainerSaveId, itemId: itemIdToConsume } },
        data: { quantity: { decrement: 1 } },
      }),
    ]);
    return results[0];
  }
}

