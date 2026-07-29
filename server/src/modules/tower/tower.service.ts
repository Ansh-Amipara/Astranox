import crypto from 'crypto';
import { TowerRepository } from './tower.repository';
import { generateTowerConfig, estimateTowerFloorCP } from '../../game/tower/generator';
import { createPokemonInstance, getMinPotentialForLevel } from '../../game/instance/PokemonInstance';
import { calculatePokemonCP } from '../../game/instance/cp';
import { PokemonInstancePayload } from '../../game/instance/types';
import { AppError } from '../../core/errors/AppError';
import { PrismaClient, BattleStatus, BattleType, Prisma } from '@prisma/client';
import { mapOwnedPokemonToInstance } from '../trainers/owned-pokemon.mapper';
import { EventsService } from '../events/events.service';

const prisma = new PrismaClient(); // For creating battle session directly here, or we can use battle service

function toActivePokemon(inst: any) {
  return {
    id: inst.id,
    speciesId: inst.species.id,
    speciesName: inst.name,
    level: inst.level,
    potential: inst.potential,
    types: inst.types,
    moves: inst.moves || [],
    maxHp: inst.maxHp,
    currentHp: inst.currentHp,
    attack: inst.stats.attack,
    defense: inst.stats.defense,
    spAtk: inst.stats.spAtk,
    spDef: inst.stats.spDef,
    speed: inst.stats.speed,
    baseExp: inst.species.baseExp || 100,
    currentXp: inst.currentXp || 0,
    status: null,
    stages: { attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 }
  };
}

export class TowerService {
  private repository = new TowerRepository();
  private eventsService = new EventsService();

  private async getValidState(trainerId: string) {
    let state = await this.repository.getStateByTrainerId(trainerId);
    if (!state) {
      state = await this.repository.createState(trainerId);
    } else {
      const now = new Date();
      const runDate = state.currentRunStartedAt ? new Date(state.currentRunStartedAt) : null;
      if (!runDate || runDate.getUTCFullYear() !== now.getUTCFullYear() || runDate.getUTCMonth() !== now.getUTCMonth() || runDate.getUTCDate() !== now.getUTCDate()) {
        state = await this.repository.resetState(state.id);
      }
    }
    return state;
  }

  async getState(trainerId: string) {
    let state = await this.getValidState(trainerId);

    // Also include active encounter if exists, otherwise generate it
    let activeEncounter = null;
    if (state.currentEncounterId) {
      activeEncounter = await this.repository.getEncounter(state.currentEncounterId);
    } else {
      activeEncounter = await this.generateNextFloorEncounter(trainerId);
      state = await this.repository.getStateByTrainerId(trainerId) as any;
    }

    const party = await prisma.ownedPokemon.findMany({
      where: { trainerId: trainerId, isParty: true },
      include: { species: true }
    });
    const playerCp = party.reduce((sum, p) => {
      const baseStats = { hp: p.species.hp, attack: p.species.attack, defense: p.species.defense, spAtk: p.species.spAtk, spDef: p.species.spDef, speed: p.species.speed };
      const ivs = { hp: p.ivHp, attack: p.ivAttack, defense: p.ivDefense, spAtk: p.ivSpAtk, spDef: p.ivSpDef, speed: p.ivSpeed };
      return sum + calculatePokemonCP(baseStats, ivs, p.level, p.potential, p.species.isGmax);
    }, 0);
    const floorCp = estimateTowerFloorCP(state!.currentFloor);

    return {
      state,
      activeEncounter,
      playerCp,
      floorCp
    };
  }

  async skipFloors(trainerId: string) {
    let state = await this.getValidState(trainerId);
    if (!state) throw new AppError('Tower state not found', 404);

    const party = await prisma.ownedPokemon.findMany({
      where: { trainerId: trainerId, isParty: true },
      include: { species: true }
    });
    const playerCp = party.reduce((sum, p) => {
      const baseStats = { hp: p.species.hp, attack: p.species.attack, defense: p.species.defense, spAtk: p.species.spAtk, spDef: p.species.spDef, speed: p.species.speed };
      const ivs = { hp: p.ivHp, attack: p.ivAttack, defense: p.ivDefense, spAtk: p.ivSpAtk, spDef: p.ivSpDef, speed: p.ivSpeed };
      return sum + calculatePokemonCP(baseStats, ivs, p.level, p.potential, p.species.isGmax);
    }, 0);

    let skippedCount = 0;
    let accumulatedCoins = 0;
    let accumulatedXp = 0;
    let currentFloor = state.currentFloor;
    const startFloor = state.currentFloor;

    while (skippedCount < 100) {
      const floorCp = estimateTowerFloorCP(currentFloor);
      if (floorCp >= playerCp * 0.1) {
        break;
      }
      const config = generateTowerConfig(currentFloor);
      accumulatedCoins += config.rewardCoins;
      accumulatedXp += config.rewardXp;
      currentFloor++;
      skippedCount++;
    }

    if (skippedCount === 0) {
      throw new AppError('Cannot skip these floors - your CP is not high enough!', 400);
    }

    // Delete current encounter if it exists
    if (state.currentEncounterId) {
      await prisma.infinityTowerEncounter.delete({ where: { id: state.currentEncounterId } });
    }

    // Update state via transaction
    await prisma.$transaction([
      prisma.infinityTowerState.update({
        where: { id: state.id },
        data: {
          currentFloor,
          highestFloor: Math.max(state.highestFloor, currentFloor - 1),
          currentEncounterId: null,
          floorsCompleted: { increment: skippedCount },
          totalVictories: { increment: skippedCount }
        }
      }),
      prisma.trainerSave.update({
        where: { id: trainerId },
        data: {
          infinityCoins: { increment: accumulatedCoins },
          storedXp: { increment: accumulatedXp }
        }
      }),
      prisma.infinityCoinTransaction.create({
        data: {
          trainerId,
          amount: accumulatedCoins,
          reason: `Auto-skipped ${skippedCount} floors`
        }
      })
    ]);

    for (let i = 0; i < skippedCount; i++) {
      await this.eventsService.emitEvent(trainerId, 'CLEAR_TOWER').catch(e => console.error(e));
    }

    const stateData = await this.getState(trainerId);
    return {
      ...stateData,
      skipResult: {
        skippedCount,
        accumulatedCoins,
        accumulatedXp,
        startFloor,
        endFloor: currentFloor
      }
    };
  }

  async generateNextFloorEncounter(trainerId: string) {
    const state = await this.getValidState(trainerId);
    if (!state) throw new AppError('Tower state not found', 404);

    if (state.currentEncounterId) {
      const existing = await this.repository.getEncounter(state.currentEncounterId);
      if (existing && existing.status === 'ACTIVE') {
        return existing;
      }
    }

    const config = generateTowerConfig(state.currentFloor);
    const speciesList = await this.repository.getRandomSpecies(config.teamSize, config.evolutionStage, config.allowLegendary);

    if (speciesList.length === 0) {
      throw new AppError('Could not generate enemy team - no species found', 500);
    }

    // Generate instances
    const enemyTeam = speciesList.map(species => {
      // Pick up to 4 moves from learnsets that are available at config.level
      const availableMoves = species.learnsets
        .filter((l: any) => l.level <= config.level)
        .map((l: any) => l.move);

      // Shuffle and take 4
      const selectedMoves = availableMoves.sort(() => 0.5 - Math.random()).slice(0, 4);

      const speciesContext = {
        id: species.id,
        name: species.name,
        types: [species.type1?.name, species.type2?.name].filter(Boolean) as string[],
        baseStats: {
          hp: species.hp,
          attack: species.attack,
          defense: species.defense,
          spAtk: species.spAtk,
          spDef: species.spDef,
          speed: species.speed
        },
        catchRate: species.catchRate || 255,
        baseExp: species.baseExp || 64,
        isGmax: species.isGmax
      };

      const payload: PokemonInstancePayload = {
        id: crypto.randomUUID(),
        nickname: species.name,
        level: config.level,
        potential: getMinPotentialForLevel(config.level, config.isBoss || config.isMegaBoss ? 'DIAMOND' : 'SILVER'),
        ivs: {
          hp: config.ivs,
          attack: config.ivs,
          defense: config.ivs,
          spAtk: config.ivs,
          spDef: config.ivs,
          speed: config.ivs
        },
        species: speciesContext,
        moves: selectedMoves.map((m: any, index: number) => ({
          moveId: m.id,
          name: m.name,
          currentSlot: index,
          type: m.type?.name || 'normal'
        }))
      };

      return createPokemonInstance(payload);
    });

    const reward = {
      infinityCoins: config.rewardCoins,
      storedXp: config.rewardXp
    };

    const encounter = await this.repository.createEncounter(
      state.id,
      state.currentFloor,
      Math.random().toString(),
      enemyTeam,
      reward
    );

    await this.repository.updateStateEncounterId(state.id, encounter.id);

    return encounter;
  }

  async startBattle(trainerId: string, playerActivePokemonId?: string) {
    const state = await this.getValidState(trainerId);
    if (!state || !state.currentEncounterId) {
      throw new AppError('No active tower encounter found', 400);
    }

    const encounter = await this.repository.getEncounter(state.currentEncounterId);
    if (!encounter || encounter.status !== 'ACTIVE') {
      throw new AppError('Encounter is not active', 400);
    }

    const enemyTeam = encounter.enemyTeam as any[];
    if (!enemyTeam || enemyTeam.length === 0) {
      throw new AppError('Enemy team is empty', 500);
    }

    // Get trainer party
    const trainer = await prisma.trainerSave.findUnique({
      where: { id: trainerId },
      include: {
        party: {
          where: { isParty: true },
          orderBy: { position: 'asc' },
          include: {
            species: { include: { type1: true, type2: true } },
            moves: { include: { move: { include: { type: true } } } }
          }
        }
      }
    });

    if (!trainer || trainer.party.length === 0) {
      throw new AppError('Trainer has no party', 400);
    }

    // Map player party to instances using existing mapper
    const playerPartyData = trainer.party.map(p => mapOwnedPokemonToInstance(p as any));

    const playerActiveData = playerPartyData.find(p => p.id === playerActivePokemonId) || playerPartyData[0];
    const opponentActiveData = enemyTeam[0];

    const mappedOpponentActive = toActivePokemon(opponentActiveData);
    const mappedEnemyTeam = enemyTeam.map(toActivePokemon);
    const mappedPlayerActive = toActivePokemon(playerActiveData);
    const mappedPlayerParty = playerPartyData.map(toActivePokemon);

    const battle = await prisma.battleSession.create({
      data: {
        trainerId,
        status: BattleStatus.ACTIVE,
        battleType: "TOWER" as unknown as BattleType,
        playerActivePokemonId: mappedPlayerActive.id,
        opponentPokemonData: mappedOpponentActive as unknown as Prisma.InputJsonValue,
        opponentPartyData: mappedEnemyTeam as unknown as Prisma.InputJsonValue,
        playerPokemonData: mappedPlayerActive as unknown as Prisma.InputJsonValue,
        playerPartyData: mappedPlayerParty as unknown as Prisma.InputJsonValue,
        log: []
      }
    });

    return battle;
  }

  async completeBattle(trainerId: string, result: 'WON' | 'LOST') {
    const state = await this.getValidState(trainerId);
    if (!state || !state.currentEncounterId) {
      throw new AppError('No active tower encounter found', 400);
    }

    const encounter = await this.repository.getEncounter(state.currentEncounterId);
    if (!encounter) throw new AppError('Encounter not found', 404);

    if (result === 'WON') {
      const reward = encounter.reward as any;
      await this.repository.clearFloor(
        state.id,
        trainerId,
        encounter.id,
        state.currentFloor + 1,
        reward.infinityCoins || 0,
        reward.storedXp || 0
      );
      await this.eventsService.emitEvent(trainerId, 'CLEAR_TOWER').catch(e => console.error(e));
    } else {
      await this.repository.failFloor(state.id, encounter.id);
    }

    // Clean up active battle sessions for TOWER
    await prisma.battleSession.deleteMany({
      where: {
        trainerId,
        battleType: "TOWER" as unknown as BattleType
      }
    });

    return this.getState(trainerId);
  }
}
