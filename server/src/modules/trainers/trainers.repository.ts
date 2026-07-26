import { PrismaClient, TrainerSave, PokemonPotential } from '@prisma/client';
import { ValidationError } from '../../common/errors/AppError';

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
          boxNumber: null as any,
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
        isEscrowed: false,
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
        where: { trainerId, isEscrowed: false },
        orderBy: [{ isParty: 'desc' }, { level: 'desc' }],
        skip,
        take: limit,
        include: { 
          species: { include: { type1: true, type2: true } },
          moves: { include: { move: { include: { type: true } } } }
        }
      }),
      prisma.ownedPokemon.count({ where: { trainerId, isEscrowed: false } })
    ]);
    return { data, total };
  }

  async removeFromParty(trainerId: string, pokemonId: string) {
    return prisma.$transaction(async (tx) => {
      const pokemon = await tx.ownedPokemon.findFirst({
        where: { id: pokemonId, trainerId, isParty: true, isEscrowed: false }
      });
      if (!pokemon) throw new Error('Pokemon not found in party');

      const partyCount = await tx.ownedPokemon.count({
        where: { trainerId, isParty: true, isEscrowed: false }
      });
      if (partyCount <= 1) {
        throw new ValidationError('You must have at least one Pokemon in your party.');
      }

      const boxed = await tx.ownedPokemon.findMany({
        where: { trainerId, isParty: false, isEscrowed: false },
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
        data: { isParty: false, boxNumber: targetBox as any, position: targetPos as number }
      });
    });
  }

  async addToParty(trainerId: string, pokemonId: string, targetPosition: number) {
    return prisma.$transaction(async (tx) => {
      const fromPokemon = await tx.ownedPokemon.findFirst({
        where: { id: pokemonId, trainerId, isParty: false, isEscrowed: false }
      });
      if (!fromPokemon) throw new Error('Pokemon not found in PC');

      const existingPartyPokemon = await tx.ownedPokemon.findFirst({
        where: { trainerId, isParty: true, position: targetPosition }
      });

      if (existingPartyPokemon) {
        await tx.ownedPokemon.update({
          where: { id: existingPartyPokemon.id },
          data: { isParty: false, boxNumber: fromPokemon.boxNumber as any, position: fromPokemon.position }
        });
      }

      await tx.ownedPokemon.update({
        where: { id: pokemonId },
        data: { isParty: true, boxNumber: null as any, position: targetPosition }
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
        where: { trainerId, isParty: from.isParty, boxNumber: from.boxNumber, position: from.position, isEscrowed: false }
      });
      const toPokemon = await tx.ownedPokemon.findFirst({
        where: { trainerId, isParty: to.isParty, boxNumber: to.boxNumber, position: to.position, isEscrowed: false }
      });

      if (from.isParty && !to.isParty && !toPokemon && fromPokemon) {
        const partyCount = await tx.ownedPokemon.count({
          where: { trainerId, isParty: true }
        });
        if (partyCount <= 1) {
          throw new ValidationError('You must have at least one Pokemon in your party.');
        }
      }

      if (fromPokemon) {
        await tx.ownedPokemon.update({
          where: { id: fromPokemon.id },
          data: { isParty: to.isParty, boxNumber: to.boxNumber as any, position: to.position }
        });
      }

      if (toPokemon) {
        await tx.ownedPokemon.update({
          where: { id: toPokemon.id },
          data: { isParty: from.isParty, boxNumber: from.boxNumber as any, position: from.position }
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

  async smeltPokemon(trainerId: string, pokemonId: string, xpReward: number, pearlRewards: { itemId: string; quantity: number }[]) {
    return prisma.$transaction(async (tx) => {
      // Manually delete dependent records to avoid referential integrity errors since schema uses NoAction
      await Promise.all([
        tx.ownedPokemonMove.deleteMany({ where: { ownedPokemonId: pokemonId } }),
        tx.tradeRequest.deleteMany({
          where: {
            OR: [
              { offeredPokemonId: pokemonId },
              { requestedPokemonId: pokemonId }
            ]
          }
        }),
        tx.escrowOfferPokemon.deleteMany({ where: { pokemonId } }),
        tx.tradeListing.deleteMany({ where: { pokemonId } })
      ]);

      const deleted = await tx.ownedPokemon.deleteMany({
        where: {
          id: pokemonId,
          trainerId,
          isEscrowed: false
        }
      });

      if (deleted.count > 0) {
        // Award XP
        await tx.trainerSave.update({
          where: { id: trainerId },
          data: { storedXp: { increment: xpReward } }
        });

        // Award Pearls
        for (const pearl of pearlRewards) {
          const existingItem = await tx.inventoryItem.findUnique({
            where: {
              trainerId_itemId: { trainerId, itemId: pearl.itemId }
            }
          });

          if (existingItem) {
            await tx.inventoryItem.update({
              where: { id: existingItem.id },
              data: { quantity: { increment: pearl.quantity } }
            });
          } else {
            await tx.inventoryItem.create({
              data: {
                trainerId,
                itemId: pearl.itemId,
                quantity: pearl.quantity
              }
            });
          }
        }
      }

      return deleted;
    }, { timeout: 15000 });
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

  async getSpeciesById(speciesId: number) {
    return prisma.species.findUnique({
      where: { id: speciesId }
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

      return tx.ownedPokemon.updateMany({
        where: { id: pokemonId, isEscrowed: false },
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

  async boostAllIvs(trainerSaveId: string, pokemonId: string, itemIdToConsume: string) {
    const results = await prisma.$transaction([
      prisma.ownedPokemon.update({
        where: { id: pokemonId, trainerId: trainerSaveId },
        data: { 
          ivHp: 31,
          ivAttack: 31,
          ivDefense: 31,
          ivSpAtk: 31,
          ivSpDef: 31,
          ivSpeed: 31
        },
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

  async findPokemonById(pokemonId: string): Promise<any> {
    return prisma.ownedPokemon.findUnique({
      where: { id: pokemonId },
      include: {
        species: { include: { type1: true, type2: true } },
        moves: { include: { move: { include: { type: true } } } }
      }
    });
  }

  async distributeXp(trainerId: string, pokemonId: string, actualAdd: number, newXp: number, newLevel: number) {
    return prisma.$transaction(async (tx) => {
      const updatedTrainer = await tx.trainerSave.update({
        where: { id: trainerId },
        data: { storedXp: { decrement: actualAdd } } as any,
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

      const updatedPokemon = await tx.ownedPokemon.update({
        where: { id: pokemonId },
        data: {
          currentXp: newXp,
          level: newLevel
        },
        include: {
          species: { include: { type1: true, type2: true } },
          moves: { include: { move: { include: { type: true } } } }
        }
      });

      return { trainer: updatedTrainer, pokemon: updatedPokemon };
    });
  }
}

