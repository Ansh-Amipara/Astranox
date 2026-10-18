import { injectable } from 'tsyringe';
import { RiftRepository } from './rift.repository';
import { TrainerRank, RiftDifficulty } from '@prisma/client';
import { AppError, NotFoundError, ValidationError } from '../../core/errors/AppError';
import { 
  RIFT_DIFFICULTY_MULTIPLIERS, RIFT_MAX_FLOORS, RIFT_BASE_INFINITY_COINS, 
  RIFT_POKEMON_POOLS, RANK_TO_TIER_MAPPING, RIFT_LEVEL_RANGES, getRiftRankWeight, RIFT_REWARD_MULTIPLIERS 
} from '../../game/constants/rift';
import { mapOwnedPokemonToInstance } from '../trainers/owned-pokemon.mapper';
import { PokemonInstance, PokemonInstancePayload } from '../../game/instance/types';
import { createPokemonInstance, getMinPotentialForLevel } from '../../game/instance/PokemonInstance';
import { toActivePokemon } from '../battles/services/battle-session.service';
import { EventsService } from '../events/events.service';
import { prisma } from '../../core/db/prisma';
import { BattlesRepository } from '../battles/repositories/battles.repository';
import { CacheService } from '../../core/services/cache.service';


@injectable()
export class RiftService {
  constructor(
    private repo: RiftRepository,
    private eventsService: EventsService,
    private battlesRepo: BattlesRepository,
    private cache: CacheService
  ) {}

  async getRiftState(userId: string) {
    const save = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) throw new NotFoundError('Trainer save not found.');
    let state = await this.repo.findStateByTrainerId(save.id);
    if (!state) {
      state = await this.repo.startRun(save.id, 'F', 'NORMAL');
      await this.repo.endRun(save.id);
    }
    return { state, rank: save.rank };
  }

  async startRun(userId: string, rank: TrainerRank, difficulty: RiftDifficulty) {
    const save = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) throw new NotFoundError('Trainer not found');
    
    if (getRiftRankWeight(rank) > getRiftRankWeight(save.rank)) {
      throw new ValidationError(`You must be at least ${rank} to enter this Rift Dungeon.`);
    }

    const state = await this.repo.startRun(save.id, rank, difficulty);

    // End any active battles in BattleSession just in case
    await this.battlesRepo.clearBattleSession(save.id);

    return state;
  }

  async generateEncounter(userId: string) {
    const save = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) throw new NotFoundError('Trainer not found');
    const state = await this.repo.findStateByTrainerId(save.id);
    if (!state || !state.currentRunStartedAt) throw new ValidationError('No active Rift run.');

    if (state.currentEncounterId) {
      // Return existing encounter battle
      const encounter = await this.repo.getActiveEncounter(state.currentEncounterId);
      const battle = await this.battlesRepo.getActiveBattleByTrainer(save.id);
      
      if (!battle) {
        // The battle was lost, fled, or otherwise ended, but the run wasn't properly abandoned.
        // Auto-abandon the run now.
        await this.abandonRun(userId);
        throw new ValidationError('Your previous battle on this floor ended. The Rift run has been closed.');
      }
      
      return { encounter, battle };
    }

    // Generate new encounter based on floor
    const floor = state.currentFloor;
    const maxFloors = RIFT_MAX_FLOORS[state.rank] || 5;
    if (floor > maxFloors) throw new ValidationError('Dungeon already completed.');

    const levelRange = RIFT_LEVEL_RANGES[state.rank];
    // Scale level slowly within the range across floors
    const levelProgress = floor / maxFloors;
    const enemyLevel = Math.floor(levelRange.min + (levelRange.max - levelRange.min) * levelProgress);

    const tier = RANK_TO_TIER_MAPPING[state.rank];
    const pool = [...RIFT_POKEMON_POOLS[tier]];
    const currentFloorPool: string[] = [];
    for (let i = 0; i < 6; i++) {
      if (pool.length === 0) break;
      const idx = Math.floor(Math.random() * pool.length);
      currentFloorPool.push(pool[idx]);
      pool.splice(idx, 1);
    }

    const enemyTeam = [];
    const multipliers = RIFT_DIFFICULTY_MULTIPLIERS[state.difficulty];
    const potential = getMinPotentialForLevel(enemyLevel);

    for (const speciesName of currentFloorPool) {
      const species = await prisma.species.findUnique({ where: { name: speciesName }, include: { type1: true, type2: true } });
      if (!species) throw new AppError(`Internal Error: Species not found: ${speciesName}`, 500);

      const learnsets = await prisma.pokemonLearnset.findMany({
        where: { speciesId: species.id, unlockLevel: { lte: enemyLevel } },
        orderBy: { unlockLevel: 'desc' },
        take: 4,
        include: { move: { include: { type: true } } }
      });

      const uniqueMoves: typeof learnsets = [];
    const seen = new Set<number>();
    for (let i = learnsets.length - 1; i >= 0; i--) {
        if (!seen.has(learnsets[i].moveId)) {
            seen.add(learnsets[i].moveId);
            uniqueMoves.unshift(learnsets[i]);
        }
    }

    const moves = uniqueMoves.slice(-4).map((l, index) => ({
      currentSlot: index + 1,
      moveId: (l as any).move.id,
      name: (l as any).move.name,
      type: (l as any).move.type.name
    }));

      const speciesContext = {
        id: species.id,
        name: species.name,
        types: [species.type1.name, species.type2?.name].filter(Boolean) as string[],
        baseStats: { hp: species.hp, attack: species.attack, defense: species.defense, spAtk: species.spAtk, spDef: species.spDef, speed: species.speed },
        isGmax: species.isGmax
      };

      const payload: PokemonInstancePayload = {
        id: `rift-enemy-${Date.now()}-${species.id}`,
        nickname: `Corrupted ${species.name}`,
        level: enemyLevel,
        potential,
        ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
        species: speciesContext,
        moves,
        isCorrupted: true,
        corruptedMultipliers: multipliers
      };

      enemyTeam.push(createPokemonInstance(payload));
    }

    // Calculate Infinity Coins Reward
    const baseCoins = RIFT_BASE_INFINITY_COINS[state.rank] || 10;
    const floorMultiplier = 1 + (floor - 1) * 0.5;
    const infinityCoins = Math.floor(baseCoins * RIFT_REWARD_MULTIPLIERS[state.difficulty] * floorMultiplier);
    const reward = { infinityCoins };

    const encounter = await this.repo.createEncounter(state.id, floor, enemyTeam, reward);
    await this.repo.updateStateCurrentEncounter(state.id, encounter.id);

    // Setup Battle Session
    const party = await this.repo.findTrainerParty(save.id);
    const playerPartyData = party.map(p => mapOwnedPokemonToInstance(p as any));
    const activePlayerPokemon = playerPartyData[0];
    if (activePlayerPokemon.currentHp <= 0) {
       // Should be healed before encounter, but just in case
       for (const p of playerPartyData) {
         if (p.currentHp > 0) activePlayerPokemon.id = p.id;
       }
    }

    const battle = await this.battlesRepo.createBattleSession({
      trainerId: save.id,
      battleType: 'RIFT',
      playerActivePokemonId: activePlayerPokemon.id,
      opponentPokemonData: toActivePokemon(enemyTeam[0]!) as any,
      playerPokemonData: toActivePokemon(activePlayerPokemon!) as any,
      playerPartyData: playerPartyData.map(p => toActivePokemon(p)) as any,
      opponentPartyData: enemyTeam.map(p => toActivePokemon(p)) as any,
    });

    return { encounter, battle };
  }

  async completeEncounter(userId: string) {
    const save = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) throw new NotFoundError('Trainer not found');
    const state = await this.repo.findStateByTrainerId(save.id);
    if (!state || !state.currentRunStartedAt || !state.currentEncounterId) {
      throw new ValidationError('No active Rift encounter.');
    }

    const encounter = await this.repo.getActiveEncounter(state.currentEncounterId);
    if (!encounter) throw new NotFoundError('Encounter not found');

    const battle = await this.cache.get<any>(`battle:${save.id}`);

    if (!battle || battle.status !== 'WON') {
      throw new ValidationError('Battle is not won yet.');
    }
    
    // Clear battle session from cache after winning
    await this.battlesRepo.clearBattleSession(save.id);

    const infinityCoins = (encounter.reward as any).infinityCoins || 0;
    const nextFloor = state.currentFloor + 1;
    const newHighestFloor = Math.max(state.highestFloor, nextFloor - 1);

    await this.repo.completeEncounter(save.id, state.id, encounter.id, nextFloor, newHighestFloor, infinityCoins);

    const maxFloors = RIFT_MAX_FLOORS[state.rank] || 5;
    let completedRun = false;
    if (nextFloor > maxFloors) {
      await this.repo.recordRunClear(state.id);
      completedRun = true;
      // Emit Event Challenge Progress
      await this.eventsService.emitEvent(save.id, 'CLEAR_RIFT').catch(e => console.error('Failed to emit event:', e));
    }

    // Auto-heal party (OwnedPokemon has currentXp, but we'll leave it as is or fix mapping)
    // Actually, OwnedPokemon doesn't have currentHp.
    // I'll skip DB heal and let Battle Engine reset to maxHp for Rift or rely on mapper.

    return { infinityCoins, completedRun, nextFloor };
  }

  async abandonRun(userId: string) {
    const save = await prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) throw new NotFoundError('Trainer not found');
    await this.repo.endRun(save.id);

    const battle = await this.cache.get<any>(`battle:${save.id}`);
    if (battle && battle.battleType === 'RIFT') {
       await this.battlesRepo.clearBattleSession(save.id);
    }

    // Heal party on exit
    // Removed because DB doesn't track currentHp.

    return { success: true };
  }
}
