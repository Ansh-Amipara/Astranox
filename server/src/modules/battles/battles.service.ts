// Trigger IDE reload
import { BattlesRepository } from './battles.repository';
import { MapRepository } from '../map/map.repository';
import { TrainersRepository } from '../trainers/trainers.repository';
import { AppError, NotFoundError, ValidationError } from '../../common/errors/AppError';
import { mapOwnedPokemonToInstance } from '../trainers/owned-pokemon.mapper';
import { ActivePokemon, BattleAction, TurnEvent } from '../../game/battle-state/types';
import { resolveTurn } from '../../game/battle-state/turn-resolver';
import { createPokemonInstance } from '../../game/instance/PokemonInstance';
import crypto from 'crypto';
import { PrismaClient, BattleStatus } from '@prisma/client';

const prisma = new PrismaClient();

function toActivePokemon(inst: any): ActivePokemon {
  return {
    id: inst.id,
    speciesName: inst.name,
    level: inst.level,
    types: inst.types,
    maxHp: inst.maxHp,
    currentHp: inst.currentHp,
    attack: inst.stats.attack,
    defense: inst.stats.defense,
    spAtk: inst.stats.spAtk,
    spDef: inst.stats.spDef,
    speed: inst.stats.speed,
    status: null,
    stages: { attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 }
  };
}

export class BattlesService {
  private repository: BattlesRepository;
  private mapRepo: MapRepository;
  private trainersRepo: TrainersRepository;

  constructor() {
    this.repository = new BattlesRepository();
    this.mapRepo = new MapRepository();
    this.trainersRepo = new TrainersRepository();
  }

  private calculateTypeMultiplier(moveType: any, defenderTypes: string[]): number {
    let multiplier = 1;
    if (!moveType || !moveType.damageRelations) return 1;

    const rels = moveType.damageRelations as any;
    const double = (rels.double_damage_to || []).map((t: any) => t.name);
    const half = (rels.half_damage_to || []).map((t: any) => t.name);
    const zero = (rels.no_damage_to || []).map((t: any) => t.name);

    for (const dType of defenderTypes) {
      if (zero.includes(dType)) return 0;
      if (double.includes(dType)) multiplier *= 2;
      if (half.includes(dType)) multiplier *= 0.5;
    }
    return multiplier;
  }

  async engageWild(trainerId: string, zoneId: number) {
    // 1. Check if user already in battle
    const active = await this.repository.getActiveBattleByTrainer(trainerId);
    if (active) {
      throw new ValidationError('You are already in a battle.');
    }

    // 2. Roll wild encounter
    const zone = await this.mapRepo.getZoneById(zoneId);
    if (!zone || zone.encounters.length === 0) {
      throw new NotFoundError('No Pokemon found here.');
    }

    const exploreRoll = Math.random();
    if (exploreRoll > 0.3) {
      return { encounter: null, battleSession: null };
    }

    const speciesRoll = Math.random();
    let cumulative = 0;
    let selectedEncounter = zone.encounters[zone.encounters.length - 1];

    for (const enc of zone.encounters) {
      cumulative += enc.encounterRate;
      if (speciesRoll <= cumulative) {
        selectedEncounter = enc;
        break;
      }
    }

    const levelRange = zone.maxLevel - zone.minLevel;
    const randomLevel = zone.minLevel + Math.floor(Math.random() * (levelRange + 1));
    const ivs = {
      hp: Math.floor(Math.random() * 32),
      attack: Math.floor(Math.random() * 32),
      defense: Math.floor(Math.random() * 32),
      spAtk: Math.floor(Math.random() * 32),
      spDef: Math.floor(Math.random() * 32),
      speed: Math.floor(Math.random() * 32),
    };

    // Construct wild PokemonInstance
    const types = [selectedEncounter.species.type1.name];
    if (selectedEncounter.species.type2) types.push(selectedEncounter.species.type2.name);
    
    const wildInstance = createPokemonInstance({
      id: crypto.randomUUID(),
      nickname: selectedEncounter.species.name,
      level: randomLevel,
      ivs,
      species: {
        id: selectedEncounter.species.id,
        name: selectedEncounter.species.name,
        types,
        baseStats: {
          hp: selectedEncounter.species.hp,
          attack: selectedEncounter.species.attack,
          defense: selectedEncounter.species.defense,
          spAtk: selectedEncounter.species.spAtk,
          spDef: selectedEncounter.species.spDef,
          speed: selectedEncounter.species.speed
        }
      }
    });

    const wildActive = toActivePokemon(wildInstance);

    // 3. Get player lead Pokemon
    const trainerSave = await this.trainersRepo.findByUserId(trainerId);
    if (!trainerSave || trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokemon to battle with!');
    }
    const lead = trainerSave.party[0]; // Already ordered by position
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);

    // 4. Create BattleSession
    const session = await this.repository.createBattleSession({
      trainerId,
      playerActivePokemonId: playerActive.id,
      wildPokemonData: wildActive,
      playerPokemonData: playerActive
    });

    return {
      encounter: {
        species: selectedEncounter.species,
        level: randomLevel
      },
      battleSession: session
    };
  }

  async getActiveSession(trainerId: string) {
    const session = await this.repository.getActiveBattleByTrainer(trainerId);
    if (!session) throw new NotFoundError('No active battle session found.');
    return session;
  }

  async submitTurn(trainerId: string, action: string) {
    const session = await this.repository.getActiveBattleByTrainer(trainerId);
    if (!session) throw new NotFoundError('No active battle session found.');
    
    if (action === 'run') {
      await this.repository.updateBattleSession(session.id, {
        status: BattleStatus.FLED,
        turnNumber: session.turnNumber,
        playerPokemonData: session.playerPokemonData,
        wildPokemonData: session.wildPokemonData,
        log: session.log,
      });
      return { status: BattleStatus.FLED, events: [{ type: 'fled' }] };
    }

    if (!action.startsWith('move:')) {
      throw new ValidationError('Invalid action');
    }

    const moveName = action.split(':')[1];
    
    // Fetch move from DB
    const playerMoveData = await prisma.move.findUnique({
      where: { name: moveName.toLowerCase() },
      include: { type: true }
    });

    if (!playerMoveData) {
      throw new ValidationError(`Move ${moveName} not found.`);
    }

    // Prepare Player Action
    const wildPokemon = session.wildPokemonData as any;
    const playerPokemon = session.playerPokemonData as any;

    const playerAction: BattleAction = {
      pokemonId: session.playerActivePokemonId,
      typeEffectivenessMultiplier: this.calculateTypeMultiplier(playerMoveData.type, wildPokemon.types),
      move: {
        name: playerMoveData.name,
        power: playerMoveData.power,
        accuracy: playerMoveData.accuracy,
        type: playerMoveData.type.name,
        priority: playerMoveData.priority,
        damageClass: playerMoveData.damageClass as any,
        ailment: playerMoveData.ailment,
        ailmentChance: playerMoveData.ailmentChance,
        flinchChance: playerMoveData.flinchChance
      }
    };

    // Wild AI logic: Just pick Tackle for now until we store moves.
    const wildMoveData = await prisma.move.findUnique({
      where: { name: 'tackle' },
      include: { type: true }
    });

    const wildAction: BattleAction = {
      pokemonId: wildPokemon.id,
      typeEffectivenessMultiplier: this.calculateTypeMultiplier(wildMoveData!.type, playerPokemon.types),
      move: {
        name: wildMoveData!.name,
        power: wildMoveData!.power,
        accuracy: wildMoveData!.accuracy,
        type: wildMoveData!.type.name,
        priority: wildMoveData!.priority,
        damageClass: wildMoveData!.damageClass as any
      }
    };

    // Resolve Turn
    const result = resolveTurn(
      session.playerPokemonData as any,
      playerAction,
      session.wildPokemonData as any,
      wildAction
    );

    // Update Session
    const newStatus = 
      result.p1State.currentHp <= 0 ? BattleStatus.LOST :
      result.p2State.currentHp <= 0 ? BattleStatus.WON :
      BattleStatus.ACTIVE;

    const updatedLog = [...(session.log as any || []), { turn: session.turnNumber, events: result.events }];

    await this.repository.updateBattleSession(session.id, {
      status: newStatus,
      turnNumber: session.turnNumber + 1,
      playerPokemonData: result.p1State as any,
      wildPokemonData: result.p2State as any,
      log: updatedLog,
    });

    return {
      status: newStatus,
      turnNumber: session.turnNumber,
      events: result.events,
      p1State: result.p1State,
      p2State: result.p2State
    };
  }
}
