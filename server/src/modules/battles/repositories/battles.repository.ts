// Trigger IDE reload
import { Prisma, PrismaClient, BattleStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class BattlesRepository {
  async runTurnTransaction<T>(handler: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await prisma.$transaction(handler, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2034' || attempt === 2) {
          throw error;
        }
      }
    }

    throw new Error('Battle transaction retry limit reached.');
  }

  async getActiveBattleForUpdate(tx: Prisma.TransactionClient, trainerId: string) {
    return tx.battleSession.findFirst({
      where: {
        trainerId,
        status: { in: [BattleStatus.ACTIVE, BattleStatus.WAITING_SWITCH, BattleStatus.WAITING_MOVE_LEARN] }
      }
    });
  }

  async getTrainerForTurn(tx: Prisma.TransactionClient, userId: string): Promise<any> {
    return tx.trainerSave.findUnique({
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
        inventory: { include: { item: true } }
      }
    });
  }

  async updateTurnIfCurrent(
    tx: Prisma.TransactionClient,
    id: string,
    expectedTurnNumber: number,
    data: Prisma.BattleSessionUpdateInput
  ): Promise<boolean> {
    const result = await tx.battleSession.updateMany({
      where: {
        id,
        turnNumber: expectedTurnNumber,
        status: { in: [BattleStatus.ACTIVE, BattleStatus.WAITING_SWITCH, BattleStatus.WAITING_MOVE_LEARN] }
      },
      data
    });

    return result.count === 1;
  }
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
        status: { in: [BattleStatus.ACTIVE, BattleStatus.WAITING_SWITCH, BattleStatus.WAITING_MOVE_LEARN] }
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
