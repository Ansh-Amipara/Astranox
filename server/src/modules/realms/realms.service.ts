// @ts-ignore - Ignore TS error until IDE reloads Prisma client
import { PrismaClient, TrainerRank, PokemonPotential } from '@prisma/client';
import { ASTRAL_REALMS, AstralRealm } from '../../game/constants/astral-realms';
import { TrainersRepository } from '../trainers/trainers.repository';
import { NotFoundError, ValidationError, ForbiddenError } from '../../common/errors/AppError';
import { BattleSessionService } from '../battles/services/battle-session.service';

const prisma = new PrismaClient();

const RANK_ORDER: TrainerRank[] = [
  TrainerRank.BLACK_IRON,
  TrainerRank.BRONZE,
  TrainerRank.SILVER,
  TrainerRank.GOLD,
  TrainerRank.PLATINUM,
  TrainerRank.DIAMOND,
  TrainerRank.EPIC,
  TrainerRank.LEGENDARY,
  TrainerRank.MYTHICAL
];

const POTENTIAL_ORDER: PokemonPotential[] = [
  PokemonPotential.BLACK_IRON,
  PokemonPotential.BRONZE,
  PokemonPotential.SILVER,
  PokemonPotential.GOLD,
  PokemonPotential.PLATINUM,
  PokemonPotential.DIAMOND,
  PokemonPotential.EPIC,
  PokemonPotential.LEGENDARY,
  PokemonPotential.MYTHICAL
];

function getRankIndex(rank: TrainerRank): number {
  return RANK_ORDER.indexOf(rank);
}

function getPotentialIndex(potential: PokemonPotential): number {
  return POTENTIAL_ORDER.indexOf(potential);
}

export class RealmsService {
  private trainersRepo = new TrainersRepository();
  private battleService = new BattleSessionService();

  async getUnlockedRealms(userId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');

    const userRankIdx = getRankIndex(trainerSave.rank);

    return ASTRAL_REALMS.map((realm) => {
      const unlockIdx = getRankIndex(realm.unlockRank);
      return {
        ...realm,
        isUnlocked: userRankIdx >= unlockIdx
      };
    });
  }

  async exploreRealm(userId: string, realmId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');

    const realm = ASTRAL_REALMS.find(r => r.id === realmId);
    if (!realm) throw new NotFoundError('Realm not found.');

    const userRankIdx = getRankIndex(trainerSave.rank);
    const unlockIdx = getRankIndex(realm.unlockRank);

    if (userRankIdx < unlockIdx) {
      throw new ForbiddenError(`You must be ${realm.unlockRank} rank to enter this realm.`);
    }

    // RNG for exploration event
    // 40% Battle, 25% Item, 20% Money, 15% Nothing
    const roll = Math.random() * 100;

    if (roll < 40) {
      // 40% chance: Battle
      return await this.triggerRealmEncounter(trainerSave, realm);
    } else if (roll < 65) {
      // 25% chance: Item
      // Simple random item (e.g., potion, pokeball, random crystal)
      const possibleItems = ['potion', 'poke-ball', 'great-ball', 'ultra-ball', 'revive'];
      const randomItemName = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      
      const item = await prisma.item.findFirst({ where: { name: randomItemName } });
      if (item) {
        await prisma.inventoryItem.upsert({
          where: { trainerId_itemId: { trainerId: trainerSave.id, itemId: item.id } },
          create: { trainerId: trainerSave.id, itemId: item.id, quantity: 1 },
          update: { quantity: { increment: 1 } }
        });
        return { event: 'item', item: { id: item.id, name: item.name, quantity: 1 } };
      }
      return { event: 'nothing' };
    } else if (roll < 85) {
      // 20% chance: Money
      const amount = Math.floor(Math.random() * 500) + 100;
      await prisma.trainerSave.update({
        where: { id: trainerSave.id },
        data: { money: { increment: amount } }
      });
      return { event: 'money', amount };
    } else {
      // 15% chance: Nothing
      return { event: 'nothing' };
    }
  }

  private async triggerRealmEncounter(trainerSave: any, realm: AstralRealm) {
    // 1. Pick random species from realm
    const speciesName = realm.pokemon[Math.floor(Math.random() * realm.pokemon.length)];
    const species = await prisma.species.findFirst({ where: { name: speciesName } });
    
    if (!species) {
      throw new ValidationError(`Species ${speciesName} not found in database.`);
    }

    // 2. Generate custom potential based on realm base rank
    // 50% one rank lower, 40% same rank, 10% one rank higher
    const basePotential = realm.basePotentialRank as unknown as PokemonPotential;
    const baseIdx = getPotentialIndex(basePotential);
    
    let rolledIdx = baseIdx;
    const pRoll = Math.random() * 100;
    
    if (pRoll < 50) {
      // One rank lower
      rolledIdx = Math.max(0, baseIdx - 1);
    } else if (pRoll < 90) {
      // Same rank
      rolledIdx = baseIdx;
    } else {
      // One rank higher, capped at LEGENDARY
      const legendaryIdx = getPotentialIndex(PokemonPotential.LEGENDARY);
      rolledIdx = Math.min(legendaryIdx, baseIdx + 1);
    }

    const assignedPotential = POTENTIAL_ORDER[rolledIdx];

    // 3. Determine level based on the potential cap
    // We want a high-level encounter, but strictly bounded by the rolled potential cap
    let minLevel = 1;
    let maxLevel = 20;

    switch (assignedPotential) {
      case 'BLACK_IRON': maxLevel = 20; minLevel = 5; break;
      case 'BRONZE': maxLevel = 40; minLevel = 20; break;
      case 'SILVER': maxLevel = 60; minLevel = 40; break;
      case 'GOLD': maxLevel = 80; minLevel = 60; break;
      case 'PLATINUM': maxLevel = 90; minLevel = 80; break;
      case 'DIAMOND': maxLevel = 100; minLevel = 90; break;
      case 'EPIC': maxLevel = 120; minLevel = 100; break;
      case 'LEGENDARY': maxLevel = 150; minLevel = 120; break;
      case 'MYTHICAL': maxLevel = 200; minLevel = 150; break;
    }

    // For example, if potential is GOLD, level is 60-80.
    const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

    // 4. Delegate to BattleSessionService using our custom realm generation method
    const sessionRes = await this.battleService.startSecretRealmEncounter(trainerSave.userId, species.id, level, assignedPotential);

    return {
      event: 'battle',
      encounter: sessionRes.encounter,
      battleSession: sessionRes.battleSession
    };
  }
}
