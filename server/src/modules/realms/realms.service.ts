import { PrismaClient, TrainerRank, PokemonPotential, AstralRealm, TrainerSave } from '@prisma/client';
import { TrainersRepository } from '../trainers/trainers.repository';
import { NotFoundError, ValidationError, ForbiddenError } from '../../common/errors/AppError';
import { BattleSessionService } from '../battles/services/battle-session.service';

const prisma = new PrismaClient();

const RANK_ORDER: TrainerRank[] = [
  TrainerRank.F_RANK,
  TrainerRank.E_RANK,
  TrainerRank.D_RANK,
  TrainerRank.C_RANK,
  TrainerRank.B_RANK,
  TrainerRank.A_RANK,
  TrainerRank.AA_RANK,
  TrainerRank.AAA_RANK,
  TrainerRank.S_RANK,
  TrainerRank.S_PLUS_RANK,
  TrainerRank.SS_RANK,
  TrainerRank.SS_PLUS_RANK,
  TrainerRank.SSS_RANK,
  TrainerRank.SSS_PLUS_RANK
];

const POTENTIAL_ORDER: PokemonPotential[] = [
  PokemonPotential.BLACK_IRON,
  PokemonPotential.BRONZE,
  PokemonPotential.SILVER,
  PokemonPotential.GOLD,
  PokemonPotential.PLATINUM,
  PokemonPotential.ADAMANTITE,
  PokemonPotential.DIAMOND,
  PokemonPotential.CRYSTAL,
  PokemonPotential.EPIC,
  PokemonPotential.HEROIC,
  PokemonPotential.SOVEREIGN,
  PokemonPotential.LEGENDARY,
  PokemonPotential.DIVINE,
  PokemonPotential.CELESTIAL,
  PokemonPotential.PRIMORDIAL,
  PokemonPotential.MYTHICAL,
  PokemonPotential.INFINITY,
  PokemonPotential.ETERNAL
];

function getRankIndex(rank: TrainerRank): number {
  return RANK_ORDER.indexOf(rank);
}

function getPotentialIndex(potential: PokemonPotential): number {
  return POTENTIAL_ORDER.indexOf(potential);
}

function getRealmLevelRange(rank: TrainerRank): { min: number; max: number } {
  switch (rank) {
    case TrainerRank.F_RANK: return { min: 1, max: 60 };
    case TrainerRank.E_RANK: return { min: 61, max: 120 };
    case TrainerRank.D_RANK: return { min: 121, max: 200 };
    case TrainerRank.C_RANK: return { min: 201, max: 400 };
    case TrainerRank.B_RANK: return { min: 401, max: 500 };
    case TrainerRank.A_RANK: return { min: 501, max: 700 };
    case TrainerRank.AA_RANK: return { min: 701, max: 900 };
    case TrainerRank.AAA_RANK: return { min: 901, max: 1100 };
    case TrainerRank.S_RANK: return { min: 1101, max: 1400 };
    case TrainerRank.S_PLUS_RANK: return { min: 1401, max: 1700 };
    case TrainerRank.SS_RANK: return { min: 1701, max: 2000 };
    case TrainerRank.SS_PLUS_RANK: return { min: 2001, max: 3000 };
    case TrainerRank.SSS_RANK: return { min: 3001, max: 4000 };
    case TrainerRank.SSS_PLUS_RANK: return { min: 4001, max: 5000 };
    default: return { min: 1, max: 30 };
  }
}

export class RealmsService {
  private trainersRepo = new TrainersRepository();
  private battleService = new BattleSessionService();

  async getUnlockedRealms(userId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');

    const userRankIdx = getRankIndex(trainerSave.rank);

    const realms = await prisma.astralRealm.findMany({
      orderBy: { tier: 'asc' }
    });

    return realms.map((realm) => {
      const unlockIdx = getRankIndex(realm.requiredRank);
      return {
        ...realm,
        isUnlocked: userRankIdx >= unlockIdx
      };
    });
  }

  async getRealmById(userId: string, realmId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');

    const realm = await prisma.astralRealm.findUnique({ where: { id: realmId } });
    if (!realm) throw new NotFoundError('Realm not found.');

    const userRankIdx = getRankIndex(trainerSave.rank);
    const unlockIdx = getRankIndex(realm.requiredRank);

    // Get possible inhabitants based on realm.habitats and realm.legendarySpawns
    const habitatNames = realm.habitats || [];
    const legendaryNames = (realm.legendarySpawns as any[])?.map((l: any) => l.name) || [];
    const allSpeciesNames = [...habitatNames, ...legendaryNames].map(n => n.toLowerCase());

    const possibleSpecies = await prisma.species.findMany({
      where: {
        name: { in: allSpeciesNames }
      },
      select: { id: true, name: true, spriteUrl: true },
    });

    const inhabitants = possibleSpecies.filter(sp => habitatNames.map((n: string) => n.toLowerCase()).includes(sp.name));
    const legendaries = possibleSpecies.filter(sp => legendaryNames.map((n: string) => n.toLowerCase()).includes(sp.name));

    return {
      ...realm,
      inhabitants,
      legendarySpeciesData: legendaries,
      isUnlocked: userRankIdx >= unlockIdx
    };
  }

  async exploreRealm(userId: string, realmId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');

    const realm = await prisma.astralRealm.findUnique({ where: { id: realmId } });
    if (!realm) throw new NotFoundError('Realm not found.');

    const userRankIdx = getRankIndex(trainerSave.rank);
    const unlockIdx = getRankIndex(realm.requiredRank);

    if (userRankIdx < unlockIdx) {
      throw new ForbiddenError(`You must be ${realm.requiredRank} rank to enter this realm.`);
    }

    // RNG for exploration event
    // 40% Battle, 25% Item, 20% Money, 15% Nothing
    const roll = Math.random() * 100;

    if (roll < 40) {
      // 40% chance: Battle
      return await this.triggerRealmEncounter(trainerSave, realm);
    } else if (roll < 65) {
      // 25% chance: Item
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

  private async triggerRealmEncounter(trainerSave: TrainerSave, realm: AstralRealm) {
    const sessionRes = await this.battleService.startRealmEncounter(trainerSave.userId, realm.id);

    return {
      event: 'battle',
      encounter: sessionRes.encounter,
      battleSession: sessionRes.battleSession
    };
  }
}
