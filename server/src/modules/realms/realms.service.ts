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

    // Get possible inhabitants
    const typesToSearch = realm.types && realm.types.length > 0 ? realm.types : ['normal'];
    const types = await prisma.type.findMany({ where: { name: { in: typesToSearch } } });
    const typeIds = types.map((t: any) => t.id);

    const isEpicOrHigher = getRankIndex(realm.requiredRank) >= getRankIndex(TrainerRank.B_RANK);

    let possibleSpecies = await prisma.species.findMany({
      where: {
        OR: [
          { type1Id: { in: typeIds } },
          { type2Id: { in: typeIds } }
        ],
        ...(isEpicOrHigher ? {} : { isLegendary: false, isMythical: false })
      },
      select: { id: true, name: true, spriteUrl: true, evolvesToId: true, evolutionLevel: true },
      orderBy: { id: 'asc' }
    });

    // Pseudo-random but stable slice based on realm id length/chars
    const realmSeed = realm.id.charCodeAt(0) + realm.id.charCodeAt(realm.id.length - 1);
    const startIdx = realmSeed % Math.max(1, possibleSpecies.length - 18);
    let inhabitants = possibleSpecies.slice(startIdx, startIdx + 18);

    // Apply auto-evolve visually so the user sees the evolved forms if minLevel guarantees evolution
    inhabitants = await Promise.all(inhabitants.map(async (sp) => {
      let currentId = sp.id;
      let finalSp = sp;
      for (let i = 0; i < 2; i++) {
        const fullSp = await prisma.species.findUnique({ where: { id: currentId }, select: { id: true, name: true, spriteUrl: true, evolvesToId: true, evolutionLevel: true }});
        if (fullSp?.evolutionLevel && realm.minLevel >= fullSp.evolutionLevel && fullSp.evolvesToId) {
           currentId = fullSp.evolvesToId;
           const evolvedSp = await prisma.species.findUnique({ where: { id: currentId }, select: { id: true, name: true, spriteUrl: true, evolvesToId: true, evolutionLevel: true }});
           if (evolvedSp) finalSp = evolvedSp;
        } else {
           break;
        }
      }
      return finalSp;
    }));

    // Deduplicate inhabitants in case evolutions overlap
    const uniqueInhabitants = Array.from(new Map(inhabitants.map(item => [item.id, item])).values());

    return {
      ...realm,
      inhabitants: uniqueInhabitants,
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
    // 1. Pick random species based on realm element types
    const typesToSearch = realm.types && realm.types.length > 0 ? realm.types : ['normal'];
    const types = await prisma.type.findMany({ where: { name: { in: typesToSearch } } });
    const typeIds = types.map((t: any) => t.id);

    const isEpicOrHigher = getRankIndex(realm.requiredRank) >= getRankIndex(TrainerRank.B_RANK);

    let possibleSpecies = await prisma.species.findMany({
      where: {
        OR: [
          { type1Id: { in: typeIds } },
          { type2Id: { in: typeIds } }
        ],
        ...(isEpicOrHigher ? {} : { isLegendary: false, isMythical: false })
      },
      select: { id: true }
    });

    if (possibleSpecies.length === 0) {
       if (realm.bossSpeciesId) {
          possibleSpecies = [{ id: realm.bossSpeciesId }];
       } else {
          throw new ValidationError(`No species found for types ${typesToSearch.join(', ')}`);
       }
    }

    // Pseudo-random but stable slice for encounters, matching getRealmById
    const realmSeed = realm.id.charCodeAt(0) + realm.id.charCodeAt(realm.id.length - 1);
    const startIdx = realmSeed % Math.max(1, possibleSpecies.length - 18);
    const inhabitantsList = possibleSpecies.slice(startIdx, startIdx + 18);

    let selectedSpeciesId = inhabitantsList[Math.floor(Math.random() * inhabitantsList.length)].id;
    let isBoss = false;

    // 15-20% chance for a Boss Encounter
    if (Math.random() < 0.20 && realm.bossSpeciesId) {
      isBoss = true;
      selectedSpeciesId = realm.bossSpeciesId;
    }

    // 2. Generate custom potential based on realm base rank (which aligns with requiredRank)
    const baseIdx = getRankIndex(realm.requiredRank as TrainerRank);
    
    let rolledIdx = baseIdx;
    const pRoll = Math.random() * 100;
    
    if (pRoll < 50) {
      rolledIdx = Math.max(0, baseIdx - 1);
    } else if (pRoll < 90) {
      rolledIdx = baseIdx;
    } else {
      const legendaryIdx = getPotentialIndex(PokemonPotential.LEGENDARY);
      rolledIdx = Math.min(legendaryIdx, baseIdx + 1);
    }

    const assignedPotential = POTENTIAL_ORDER[rolledIdx];

    // 3. Determine level based on the newly mapped maxLevel / minLevel in DB
    const level = Math.floor(Math.random() * (realm.maxLevel - realm.minLevel + 1)) + realm.minLevel;

    // Auto-evolve if not a boss
    if (!isBoss) {
      for (let i = 0; i < 2; i++) {
        const currentSpecies = await prisma.species.findUnique({ where: { id: selectedSpeciesId }, select: { evolutionLevel: true, evolvesToId: true } });
        if (currentSpecies?.evolutionLevel && level >= currentSpecies.evolutionLevel && currentSpecies.evolvesToId) {
          selectedSpeciesId = currentSpecies.evolvesToId;
        } else {
          break;
        }
      }
    }

    // 4. Delegate to BattleSessionService
    const sessionRes = await this.battleService.startSecretRealmEncounter(trainerSave.userId, selectedSpeciesId, level, assignedPotential, isBoss);

    return {
      event: 'battle',
      encounter: sessionRes.encounter,
      battleSession: sessionRes.battleSession
    };
  }
}
