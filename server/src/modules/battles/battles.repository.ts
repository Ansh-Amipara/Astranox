// Trigger IDE reload
import { PrismaClient, BattleStatus, BattleSession } from '@prisma/client';

const prisma = new PrismaClient();

export class BattlesRepository {
  async createBattleSession(data: {
    trainerId: string;
    playerActivePokemonId: string;
    wildPokemonData: any;
    playerPokemonData: any;
  }) {
    return prisma.battleSession.create({
      data: {
        trainerId: data.trainerId,
        playerActivePokemonId: data.playerActivePokemonId,
        wildPokemonData: data.wildPokemonData,
        playerPokemonData: data.playerPokemonData,
        log: [],
        status: BattleStatus.ACTIVE,
        turnNumber: 1
      }
    });
  }

  async getBattleSession(id: string) {
    return prisma.battleSession.findUnique({
      where: { id }
    });
  }

  async getActiveBattleByTrainer(trainerId: string) {
    return prisma.battleSession.findFirst({
      where: {
        trainerId,
        status: BattleStatus.ACTIVE
      }
    });
  }

  async updateBattleSession(
    id: string, 
    data: { 
      status: BattleStatus; 
      turnNumber: number; 
      wildPokemonData: any; 
      playerPokemonData: any; 
      log: any; 
    }
  ) {
    return prisma.battleSession.update({
      where: { id },
      data
    });
  }
}
