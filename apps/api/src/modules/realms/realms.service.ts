import { injectable } from 'tsyringe';
import { RealmsRepository } from './realms.repository';
import { TrainersRepository } from '../trainers/trainers.repository';
import { BattlesRepository } from '../battles/repositories/battles.repository';
import { BattleSessionService } from '../battles/services/battle-session.service';
import { FeatureFlagService } from '../../core/services/feature-flag.service';
import { prisma } from '../../core/db/prisma';
import {
  NotFoundError,
  ValidationError,
  FeatureDisabledError,
} from '../../core/errors/AppError';
import {
  RealmOverviewDto,
  RealmDetailDto,
  RealmSearchResultDto,
  RealmSpawnEntry,
} from '@astranox/types';
import { rollWeightedEntry, rollLevel } from '@astranox/utils';

@injectable()
export class RealmsService {
  constructor(
    private realmsRepo: RealmsRepository,
    private trainersRepo: TrainersRepository,
    private battlesRepo: BattlesRepository,
    private battleSessionService: BattleSessionService,
    private flagService: FeatureFlagService
  ) {}

  private async assertEnabled() {
    const isEnabled = await this.flagService.isEnabled('realms');
    if (!isEnabled) {
      throw new FeatureDisabledError("The 'realms' feature is currently disabled.");
    }
  }

  async listRealms(): Promise<RealmOverviewDto[]> {
    await this.assertEnabled();
    const realms = await this.realmsRepo.listRealms();

    return realms.map((r) => {
      const spawns = (r.spawns as unknown as RealmSpawnEntry[]) || [];
      return {
        id: r.id,
        realmId: r.realmId,
        name: r.name,
        description: r.description,
        themeKey: r.themeKey,
        types: r.types,
        spawnLevelMin: r.spawnLevelMin,
        spawnLevelMax: r.spawnLevelMax,
        speciesCount: spawns.length,
        enabled: r.enabled,
        sortOrder: r.sortOrder,
      };
    });
  }

  async getRealmDetail(userId: string, realmId: string): Promise<RealmDetailDto> {
    await this.assertEnabled();
    const realm = await this.realmsRepo.findByRealmId(realmId);
    if (!realm) {
      throw new NotFoundError(`Realm '${realmId}' not found.`);
    }

    const trainer = await this.trainersRepo.findByUserId(userId);
    let caughtSpeciesIds = new Set<number>();
    if (trainer) {
      const owned = await prisma.ownedPokemon.findMany({
        where: { trainerId: trainer.id },
        select: { speciesId: true },
      });
      caughtSpeciesIds = new Set(owned.map((o) => o.speciesId));
    }

    const spawns = (realm.spawns as unknown as RealmSpawnEntry[]) || [];

    // Fetch spriteUrls for all species in this Realm
    const speciesIds = spawns.map((s) => s.speciesId);
    const speciesRecords = await prisma.species.findMany({
      where: { id: { in: speciesIds } },
      select: { id: true, spriteUrl: true },
    });
    const spriteMap = new Map(speciesRecords.map((s) => [s.id, s.spriteUrl]));

    const speciesPreview = spawns.map((s) => ({
      speciesId: s.speciesId,
      speciesName: s.speciesName,
      types: s.types,
      rank: s.rank,
      spriteUrl: spriteMap.get(s.speciesId) || '',
      isApex: Boolean(s.isApex),
      isCaught: caughtSpeciesIds.has(s.speciesId),
    }));

    return {
      id: realm.id,
      realmId: realm.realmId,
      name: realm.name,
      description: realm.description,
      themeKey: realm.themeKey,
      types: realm.types,
      spawnLevelMin: realm.spawnLevelMin,
      spawnLevelMax: realm.spawnLevelMax,
      speciesCount: spawns.length,
      enabled: realm.enabled,
      sortOrder: realm.sortOrder,
      species: speciesPreview,
      totalSpecies: spawns.length,
    };
  }

  async searchRealm(
    userId: string,
    realmId: string,
    rng: () => number = Math.random
  ): Promise<RealmSearchResultDto> {
    await this.assertEnabled();

    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found.');
    }

    // Party validation: must have conscious Pokemon
    if (!trainerSave.party || trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokémon in your party to search with!');
    }
    const consciousLead = trainerSave.party.find(
      (p: any) => p.currentHp === undefined || p.currentHp > 0
    );
    if (!consciousLead) {
      throw new ValidationError('All your Pokémon have fainted! Visit the Pokécenter or heal your team first.');
    }

    // Check for active battle
    const activeBattle = await this.battlesRepo.getActiveBattleByTrainer(trainerSave.id);
    if (activeBattle) {
      if (
        activeBattle.status === 'ACTIVE' ||
        activeBattle.status === 'WAITING_SWITCH' ||
        activeBattle.status === 'WAITING_MOVE_LEARN'
      ) {
        const opp = activeBattle.opponentPokemonData as any;
        return {
          encounter: {
            speciesId: opp.speciesId,
            speciesName: opp.speciesName || opp.name,
            level: opp.level,
            types: opp.types || [],
            spriteUrl: opp.spriteUrl || '',
            isApex: Boolean(opp.isApex),
            rank: opp.rank || 'F',
          },
          battleId: activeBattle.id,
          redirectTo: `/battle?returnUrl=/realm/${realmId}`,
        };
      }
    }

    const realm = await this.realmsRepo.findByRealmId(realmId);
    if (!realm || !realm.enabled) {
      throw new NotFoundError(`Realm '${realmId}' not found or is currently closed.`);
    }

    const spawns = (realm.spawns as unknown as RealmSpawnEntry[]) || [];
    if (spawns.length === 0) {
      throw new ValidationError(`Realm '${realmId}' has no wild species registered.`);
    }

    // 1. Roll wild species using pure weighted algorithm
    const selectedEntry = rollWeightedEntry(spawns, rng);

    // 2. Roll wild level within realm bounds
    const minLvl = selectedEntry.minLevel ?? realm.spawnLevelMin;
    const maxLvl = selectedEntry.maxLevel ?? realm.spawnLevelMax;
    const level = rollLevel(minLvl, maxLvl, rng);

    // 3. Start authoritative battle session
    const customEncounter: any = await this.battleSessionService.startCustomEncounter(
      userId,
      selectedEntry.speciesId,
      level,
      'WILD'
    );

    const session = customEncounter?.battleSession ?? customEncounter;
    const opp = session?.opponentPokemonData;

    return {
      encounter: {
        speciesId: selectedEntry.speciesId,
        speciesName: selectedEntry.speciesName,
        level,
        types: selectedEntry.types,
        spriteUrl: opp?.spriteUrl || customEncounter?.encounter?.species?.spriteUrl || '',
        isApex: Boolean(selectedEntry.isApex),
        rank: selectedEntry.rank,
      },
      battleId: session?.id,
      redirectTo: `/battle?returnUrl=/realm/${realmId}`,
    };
  }
}
