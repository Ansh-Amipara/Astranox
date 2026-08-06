import { injectable } from 'tsyringe';
import { PrismaClient, InfinityTowerState, InfinityTowerEncounter, EncounterStatus, Prisma, InfinityCoinTransaction } from '@prisma/client';
import { prisma } from '../../core/db/prisma';



@injectable()
export class TowerRepository {
  async getStateByTrainerId(trainerId: string): Promise<InfinityTowerState | null> {
    return prisma.infinityTowerState.findUnique({
      where: { trainerId }
    });
  }

  async createState(trainerId: string): Promise<InfinityTowerState> {
    return prisma.infinityTowerState.create({
      data: {
        trainerId,
        currentFloor: 1,
        highestFloor: 0,
        infinityCoins: 0,
        currentRunStartedAt: new Date()
      }
    });
  }

  async resetState(stateId: string): Promise<InfinityTowerState> {
    await prisma.infinityTowerEncounter.deleteMany({
      where: { towerStateId: stateId }
    });

    return prisma.infinityTowerState.update({
      where: { id: stateId },
      data: {
        currentFloor: 1,
        currentEncounterId: null,
        currentRunStartedAt: new Date()
      }
    });
  }

  async getEncounter(encounterId: string): Promise<InfinityTowerEncounter | null> {
    return prisma.infinityTowerEncounter.findUnique({
      where: { id: encounterId }
    });
  }

  async getActiveEncounterForState(towerStateId: string, floor: number): Promise<InfinityTowerEncounter | null> {
    return prisma.infinityTowerEncounter.findFirst({
      where: {
        towerStateId,
        floor,
        status: EncounterStatus.ACTIVE
      }
    });
  }

  async createEncounter(
    towerStateId: string,
    floor: number,
    seed: string,
    enemyTeam: any,
    reward: any
  ): Promise<InfinityTowerEncounter> {
    return prisma.infinityTowerEncounter.create({
      data: {
        towerStateId,
        floor,
        seed,
        enemyTeam: enemyTeam as Prisma.InputJsonValue,
        reward: reward as Prisma.InputJsonValue,
        status: EncounterStatus.ACTIVE
      }
    });
  }

  async updateStateEncounterId(stateId: string, encounterId: string | null): Promise<InfinityTowerState> {
    return prisma.infinityTowerState.update({
      where: { id: stateId },
      data: { currentEncounterId: encounterId }
    });
  }

  async clearFloor(
    stateId: string,
    trainerId: string,
    encounterId: string,
    nextFloor: number,
    rewardCoins: number,
    rewardXp: number = 0
  ): Promise<void> {
    await prisma.$transaction([
      prisma.infinityTowerEncounter.update({
        where: { id: encounterId },
        data: { status: EncounterStatus.CLEARED }
      }),
      prisma.infinityTowerState.update({
        where: { id: stateId },
        data: {
          currentFloor: nextFloor,
          highestFloor: nextFloor - 1,
          currentEncounterId: null,
          floorsCompleted: { increment: 1 },
          totalVictories: { increment: 1 }
        }
      }),
      prisma.trainerSave.update({
        where: { id: trainerId },
        data: {
          infinityCoins: { increment: rewardCoins },
          storedXp: { increment: rewardXp }
        }
      }),
      prisma.infinityCoinTransaction.create({
        data: {
          trainerId,
          amount: rewardCoins,
          reason: `Cleared floor ${nextFloor - 1}`
        }
      })
    ]);
  }

  async failFloor(stateId: string, encounterId: string): Promise<void> {
    await prisma.$transaction([
      prisma.infinityTowerEncounter.update({
        where: { id: encounterId },
        data: { status: EncounterStatus.FAILED }
      }),
      prisma.infinityTowerState.update({
        where: { id: stateId },
        data: {
          currentEncounterId: null,
          totalDefeats: { increment: 1 }
        }
      })
    ]);
  }

  // To build the team, we need species data.
  async getRandomSpecies(count: number, config: import('../../game/tower/generator').TowerEncounterConfig): Promise<any[]> {
    const where: any = {};
    const excludedCategories: string[] = [];

    if (!config.allowLegendaryMythical) {
      excludedCategories.push('Legendary', 'Mythical');
    }
    if (!config.allowPseudoLegendary) {
      excludedCategories.push('Pseudo Legendary');
    }
    if (!config.allowParadoxUltraBeast) {
      excludedCategories.push('Paradox', 'Ultra Beast');
    }

    if (excludedCategories.length > 0) {
      where.category = { notIn: excludedCategories };
    }

    if (!config.allowMega) {
      where.isMega = false;
    }
    if (!config.allowGmax) {
      where.isGmax = false;
    }

    // Simplistic evolution filtering based on basic fields
    if (config.evolutionStage === 'BASIC') {
      where.evolvesFrom = { none: {} };
    } else if (config.evolutionStage === 'FINAL') {
      where.evolvesToId = { isSet: false };
      where.baseExp = { gte: 115 }; // Filters out Baby Pokémon with broken DB links
    } else if (config.evolutionStage === 'MIDDLE') {
      where.evolvesFrom = { some: {} };
      where.evolvesToId = { isSet: true };
    }

    const matchingIds = await prisma.species.findMany({
      where,
      select: { id: true }
    });

    if (matchingIds.length === 0) return [];

    // Shuffle and slice
    const shuffledIds = matchingIds.sort(() => 0.5 - Math.random()).slice(0, count).map(s => s.id);

    // Fetch full data for selected species
    const matching = await prisma.species.findMany({
      where: { id: { in: shuffledIds } },
      include: {
        type1: true,
        type2: true,
        learnsets: {
          include: { 
            move: {
              include: { type: true }
            } 
          }
        }
      }
    });

    return matching;
  }
}
