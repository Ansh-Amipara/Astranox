import { injectable } from 'tsyringe';
import { PrismaClient, RiftDifficulty, TrainerRank } from '@prisma/client';
import { prisma } from '../../core/db/prisma';


@injectable()
export class RiftRepository {
  private prisma = new PrismaClient();

  async findStateByTrainerId(trainerId: string) {
    return this.prisma.riftDungeonState.findUnique({
      where: { trainerId }
    });
  }

  async startRun(trainerId: string, rank: TrainerRank, difficulty: RiftDifficulty) {
    return this.prisma.riftDungeonState.upsert({
      where: { trainerId },
      update: {
        rank,
        difficulty,
        currentFloor: 1,
        currentRunStartedAt: new Date(),
        currentEncounterId: null
      },
      create: {
        trainerId,
        rank,
        difficulty,
        currentFloor: 1,
        highestFloor: 0,
        currentRunStartedAt: new Date()
      }
    });
  }

  async endRun(trainerId: string) {
    return this.prisma.riftDungeonState.update({
      where: { trainerId },
      data: {
        currentRunStartedAt: null,
        currentEncounterId: null,
        currentFloor: 1
      }
    });
  }

  async createEncounter(stateId: string, floor: number, enemyTeam: any, reward: any) {
    return this.prisma.riftEncounter.create({
      data: {
        riftStateId: stateId,
        floor,
        enemyTeam,
        reward,
        status: 'ACTIVE'
      }
    });
  }

  async updateStateCurrentEncounter(stateId: string, encounterId: string) {
    return this.prisma.riftDungeonState.update({
      where: { id: stateId },
      data: { currentEncounterId: encounterId }
    });
  }

  async getActiveEncounter(encounterId: string) {
    return this.prisma.riftEncounter.findUnique({
      where: { id: encounterId }
    });
  }

  async completeEncounter(trainerId: string, stateId: string, encounterId: string, nextFloor: number, newHighestFloor: number, infinityCoinsReward: number) {
    return this.prisma.$transaction([
      this.prisma.riftEncounter.update({
        where: { id: encounterId },
        data: { status: 'CLEARED' }
      }),
      this.prisma.riftDungeonState.update({
        where: { id: stateId },
        data: {
          currentFloor: nextFloor,
          highestFloor: newHighestFloor,
          currentEncounterId: null,
        }
      }),
      this.prisma.trainerSave.update({
        where: { id: trainerId },
        data: {
          infinityCoins: { increment: infinityCoinsReward }
        }
      })
    ]);
  }

  async recordRunClear(stateId: string) {
    return this.prisma.riftDungeonState.update({
      where: { id: stateId },
      data: {
        totalRiftsCleared: { increment: 1 },
        currentRunStartedAt: null,
        currentEncounterId: null,
        currentFloor: 1
      }
    });
  }

  async findTrainerParty(trainerId: string) {
    return this.prisma.ownedPokemon.findMany({
      where: { trainerId, isParty: true },
      orderBy: { position: 'asc' },
      include: {
        species: { include: { type1: true, type2: true } },
        equippedMoves: { include: { move: { include: { type: true } } } }
      }
    });
  }
}
