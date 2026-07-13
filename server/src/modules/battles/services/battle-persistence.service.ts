import { Prisma } from '@prisma/client';
import { BattlesRepository } from '../repositories/battles.repository';

export class BattlePersistenceService {
  constructor(private repo: BattlesRepository = new BattlesRepository()) {}

  async runTurnTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.repo.runTurnTransaction(fn);
  }

  async getTrainerForTurn(tx: Prisma.TransactionClient, userId: string) {
    return this.repo.getTrainerForTurn(tx, userId);
  }

  async getActiveBattleForUpdate(tx: Prisma.TransactionClient, trainerId: string) {
    return this.repo.getActiveBattleForUpdate(tx, trainerId);
  }

  async updateTurnIfCurrent(tx: Prisma.TransactionClient, sessionId: string, currentTurnNumber: number, data: any) {
    return this.repo.updateTurnIfCurrent(tx, sessionId, currentTurnNumber, data);
  }

  async saveCaughtPokemon(trainerSave: any, wildPokemon: any, tx: Prisma.TransactionClient) {
    const partyCount = trainerSave.party.length;
    const isParty = partyCount < 6;
    let boxNumber: number | null = null;
    let position = partyCount;

    if (!isParty) {
      boxNumber = 1;
      const boxMons = await tx.ownedPokemon.findMany({
        where: { trainerId: trainerSave.id, isParty: false, boxNumber: 1 }
      });
      position = boxMons.length;
    }

    const newPokemon = await tx.ownedPokemon.create({
      data: {
        trainerId: trainerSave.id,
        speciesId: wildPokemon.speciesId,
        level: wildPokemon.level,
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
      await tx.ownedPokemonMove.createMany({
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
     await tx.ownedPokemonMove.deleteMany({
       where: { ownedPokemonId: playerPokemonId, slot: slotToReplace }
     });
     await tx.ownedPokemonMove.create({
       data: {
         ownedPokemonId: playerPokemonId,
         moveId: pendingMoveId,
         slot: slotToReplace
       }
     });
  }
}
