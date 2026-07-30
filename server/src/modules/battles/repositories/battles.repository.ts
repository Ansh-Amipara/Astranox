import { injectable } from 'tsyringe';
// Trigger IDE reload
import { Prisma, PrismaClient, BattleStatus } from '@prisma/client';
import { prisma } from '../../../core/db/prisma';
import { CacheService } from '../../../core/services/cache.service';
import { randomUUID } from 'crypto';

@injectable()
export class BattlesRepository {
  constructor(private cache: CacheService) {}

  async runTurnTransaction<T>(handler: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await prisma.$transaction(handler, { timeout: 15000 });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2034' || attempt === 2) {
          throw error;
        }
      }
    }
    throw new Error('Battle transaction retry limit reached.');
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

  async getActiveBattleByTrainer(trainerId: string) {
    const session = await this.cache.get<any>(`battle:${trainerId}`);
    if (session && [BattleStatus.ACTIVE, BattleStatus.WAITING_SWITCH, BattleStatus.WAITING_MOVE_LEARN].includes(session.status)) {
      return session;
    }
    return null;
  }

  async getBattleSession(id: string) {
    // To support querying by ID, we need to know the trainerId or loop. 
    // Usually we query by trainerId. We will throw here if needed or just use trainerId instead.
    throw new Error('getBattleSession by ID is deprecated in Redis mode. Use getActiveBattleByTrainer.');
  }

  async createBattleSession(data: {
    trainerId: string;
    playerActivePokemonId: string;
    opponentPokemonData: any;
    opponentPartyData?: any;
    playerPokemonData: any;
    playerPartyData: any;
    battleType?: any;
  }) {
    const session = {
      id: randomUUID(),
      trainerId: data.trainerId,
      playerActivePokemonId: data.playerActivePokemonId,
      opponentPokemonData: data.opponentPokemonData,
      opponentPartyData: data.opponentPartyData,
      playerPokemonData: data.playerPokemonData,
      playerPartyData: data.playerPartyData,
      battleType: data.battleType || 'WILD',
      log: [],
      status: BattleStatus.ACTIVE,
      turnNumber: 1
    };
    
    // Set with 24-hour TTL
    await this.cache.set(`battle:${data.trainerId}`, session, 86400);
    return session;
  }

  async updateBattleSession(
    trainerId: string, 
    data: any
  ) {
    const session = await this.cache.get<any>(`battle:${trainerId}`);
    if (!session) return null;

    const updated = { ...session, ...data };
    await this.cache.set(`battle:${trainerId}`, updated, 86400);
    return updated;
  }

  async clearBattleSession(trainerId: string) {
    await this.cache.delete(`battle:${trainerId}`);
  }
}

