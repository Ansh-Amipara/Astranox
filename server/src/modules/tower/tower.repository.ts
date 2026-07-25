import { PrismaClient, InfinityTowerState, InfinityTowerEncounter, EncounterStatus, Prisma, InfinityCoinTransaction } from '@prisma/client';

const prisma = new PrismaClient();

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
  async getRandomSpecies(count: number, evolutionStage: 'BASIC' | 'MIDDLE' | 'FINAL' | 'ANY', allowLegendary: boolean): Promise<any[]> {
    // We can fetch all matching, then pick random in memory, or use mongo raw.
    // Given Astranox data size (1025 species), fetching in memory is fine if filtered.
    const where: any = {};
    if (!allowLegendary) {
      where.isLegendary = false;
      where.isMythical = false;
    }
    
    // Simplistic evolution filtering based on basic fields
    if (evolutionStage === 'BASIC') {
      where.evolvesFrom = { none: {} };
    } else if (evolutionStage === 'FINAL') {
      // In Prisma MongoDB, fields omitted during seed need isSet: false
      where.evolvesToId = { isSet: false };
    } else if (evolutionStage === 'MIDDLE') {
      where.evolvesFrom = { some: {} };
      where.evolvesToId = { isSet: true };
    }

    const matching = await prisma.species.findMany({
      where,
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

    // Shuffle and slice
    const shuffled = matching.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
