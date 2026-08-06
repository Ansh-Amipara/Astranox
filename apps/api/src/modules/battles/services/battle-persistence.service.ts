import { injectable } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { BattlesRepository } from '../repositories/battles.repository';

@injectable()
export class BattlePersistenceService {
  constructor(private repo: BattlesRepository) {}
  
  async runTurnTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.repo.runTurnTransaction(fn);
  }

  async getTrainerForTurn(tx: Prisma.TransactionClient, userId: string) {
    return this.repo.getTrainerForTurn(tx, userId);
  }

  async getActiveBattleForUpdate(trainerId: string) {
    return this.repo.getActiveBattleByTrainer(trainerId);
  }

  async updateTurnIfCurrent(trainerId: string, currentTurnNumber: number, data: any) {
    const session = await this.repo.getActiveBattleByTrainer(trainerId);
    if (!session || session.turnNumber !== currentTurnNumber) {
      return false;
    }
    await this.repo.updateBattleSession(trainerId, data);
    return true;
  }

  async saveCaughtPokemon(trainerSave: any, wildPokemon: any, tx: Prisma.TransactionClient) {
    const isParty = false;
    let boxNumber: number | null = null;
    let position = 0;

    const maxPositionResult = await tx.ownedPokemon.aggregate({
      where: { trainerId: trainerSave.id, isParty: false },
      _max: { position: true }
    });
    position = (maxPositionResult._max.position ?? -1) + 1;

    const newPokemon = await tx.ownedPokemon.create({
      data: {
        trainerId: trainerSave.id,
        speciesId: wildPokemon.speciesId,
        level: wildPokemon.level,
        // @ts-ignore
        potential: wildPokemon.potential as any,
        currentXp: wildPokemon.level * 1000,
        isParty,
        boxNumber,
        position,
        ivHp: Math.floor(Math.random() * 32),
        ivAttack: Math.floor(Math.random() * 32),
        ivDefense: Math.floor(Math.random() * 32),
        ivSpAtk: Math.floor(Math.random() * 32),
        ivSpDef: Math.floor(Math.random() * 32),
        ivSpeed: Math.floor(Math.random() * 32),
      }
    });

    if (wildPokemon.moves && wildPokemon.moves.length > 0) {
      await tx.pokemonEquippedMoves.createMany({
        data: wildPokemon.moves.map((m: any) => ({
          ownedPokemonId: newPokemon.id,
          moveId: m.moveId,
          slot: m.currentSlot
        }))
      });
    }
  }

  async useItem(inventoryItemId: string, currentQuantity: number, tx: Prisma.TransactionClient) {
    await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { quantity: currentQuantity - 1 }
    });
  }

  async syncPartyExperience(playerPartyData: any[], p1State: any, tx: Prisma.TransactionClient) {
    for (const p of playerPartyData) {
      if (p.id === p1State.id) {
        p.currentXp = p1State.currentXp;
        p.level = p1State.level;
      }
      await tx.ownedPokemon.update({
        where: { id: p.id },
        data: {
          currentXp: p.currentXp,
          level: p.level
        }
      });
    }
  }

  async learnMove(playerPokemonId: string, pendingMoveId: number, slotToReplace: number, tx: Prisma.TransactionClient) {
     await tx.pokemonEquippedMoves.deleteMany({
       where: { ownedPokemonId: playerPokemonId, slot: slotToReplace }
     });
     await tx.pokemonEquippedMoves.create({
       data: {
         ownedPokemonId: playerPokemonId,
         moveId: pendingMoveId,
         slot: slotToReplace
       }
     });
  }
}
