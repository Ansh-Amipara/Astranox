// Trigger IDE reload
import { PrismaClient, BattleStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class BattlesRepository {
  async createBattleSession(data: {
    trainerId: string;
    playerActivePokemonId: string;
    opponentPokemonData: any;
    opponentPartyData?: any;
    playerPokemonData: any;
    playerPartyData: any;
    battleType?: any;
    npcTrainerId?: string | null;
  }) {
    return prisma.battleSession.create({
      data: {
        trainerId: data.trainerId,
        playerActivePokemonId: data.playerActivePokemonId,
        opponentPokemonData: data.opponentPokemonData,
        opponentPartyData: data.opponentPartyData,
        playerPokemonData: data.playerPokemonData,
        playerPartyData: data.playerPartyData,
        battleType: data.battleType || 'WILD',
        npcTrainerId: data.npcTrainerId,
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
        status: { in: [BattleStatus.ACTIVE, BattleStatus.WAITING_SWITCH] }
      }
    });
  }

  async updateBattleSession(
    id: string, 
    data: { 
      status?: BattleStatus; 
      turnNumber?: number; 
      playerActivePokemonId?: string;
      opponentPokemonData?: any;
      opponentPartyData?: any;
      playerPokemonData?: any;
      playerPartyData?: any; 
      log?: any; 
    }
  ) {
    return prisma.battleSession.update({
      where: { id },
      data
    });
  }
}
