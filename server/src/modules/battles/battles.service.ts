// Trigger IDE reload
import { BattlesRepository } from './battles.repository';
import { MapRepository } from '../map/map.repository';
import { TrainersRepository } from '../trainers/trainers.repository';
import { AppError, NotFoundError, ValidationError } from '../../common/errors/AppError';
import { mapOwnedPokemonToInstance } from '../trainers/owned-pokemon.mapper';
import { ActivePokemon, BattleAction, TurnEvent } from '../../game/battle-state/types';
import { resolveTurn } from '../../game/battle-state/turn-resolver';
import { createPokemonInstance } from '../../game/instance/PokemonInstance';
import { getBallBonus } from '../../game/battle/catch-math';
import crypto from 'crypto';
import { PrismaClient, BattleStatus } from '@prisma/client';

const prisma = new PrismaClient();

function toActivePokemon(inst: any): ActivePokemon {
  return {
    id: inst.id,
    speciesId: inst.species.id,
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
    catchRate: inst.species.catchRate || 255,
    baseExp: inst.species.baseExp || 100,
    currentXp: inst.currentXp || 0,
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

  async engageWild(userId: string, zoneId: number) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer profile not found.');
    }
    const trainerId = trainerSave.id;

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
      },
      moves: ['tackle']
    });

    const wildActive = toActivePokemon(wildInstance);

    // 3. Get player lead Pokemon
    if (trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokemon to battle with!');
    }
    const lead = trainerSave.party[0]; // Already ordered by position
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);

    // 4. Create BattleSession
    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.repository.createBattleSession({
      trainerId,
      playerActivePokemonId: playerActive.id,
      wildPokemonData: wildActive,
      playerPokemonData: playerActive,
      playerPartyData
    });

    return {
      encounter: {
        species: selectedEncounter.species,
        level: randomLevel
      },
      battleSession: session
    };
  }

  async getActiveSession(userId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');
    const session = await this.repository.getActiveBattleByTrainer(trainerSave.id);
    if (!session) throw new NotFoundError('No active battle session found.');
    return session;
  }

  async submitTurn(userId: string, action: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');
    const session = await this.repository.getActiveBattleByTrainer(trainerSave.id);
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

    let playerAction: BattleAction;
    const wildPokemon = session.wildPokemonData as any;
    let playerPokemon = session.playerPokemonData as any;
    let playerPartyData = (session.playerPartyData as any[]) || [];

    if (session.status === BattleStatus.WAITING_SWITCH) {
      if (!action.startsWith('switch:')) {
        throw new ValidationError('You must switch in a new Pokemon.');
      }
      const targetId = action.split(':')[1];
      const targetData = playerPartyData.find(p => p.id === targetId);
      if (!targetData || targetData.currentHp <= 0) {
        throw new ValidationError('Invalid switch target.');
      }
      
      // We don't save the old one since it already saved its fainted state at the end of last turn.
      playerPokemon = targetData;
      session.playerActivePokemonId = targetId;
      session.playerPokemonData = targetData;

      // Update session and return early, no turn resolution for wild pokemon
      await this.repository.updateBattleSession(session.id, {
        status: BattleStatus.ACTIVE,
        playerActivePokemonId: targetId,
        playerPokemonData: targetData,
        log: [...(session.log as any || []), { turn: session.turnNumber, events: [{ type: 'switch', pokemonId: targetId, targetPokemonId: targetId, name: targetData.speciesName, isPlayer: true }] }]
      });

      return {
        status: BattleStatus.ACTIVE,
        turnNumber: session.turnNumber,
        events: [],
        p1State: targetData,
        p2State: wildPokemon
      };
    }

    if (action.startsWith('switch:')) {
      const targetId = action.split(':')[1];
      const targetData = playerPartyData.find(p => p.id === targetId);
      if (!targetData || targetData.currentHp <= 0) {
        throw new ValidationError('Invalid switch target.');
      }

      // We are about to execute a turn. Update old pokemon in party data
      const oldIndex = playerPartyData.findIndex(p => p.id === playerPokemon.id);
      if (oldIndex !== -1) playerPartyData[oldIndex] = playerPokemon;

      playerPokemon = targetData;
      session.playerActivePokemonId = targetId;

      playerAction = {
        type: 'switch',
        pokemonId: targetId,
        targetPokemonId: targetId
      };
    } else if (action.startsWith('item:')) {
      const itemName = action.split(':')[1];
      const inventoryItem = trainerSave.inventory.find((i: any) => i.item.name === itemName);
      
      if (!inventoryItem || inventoryItem.quantity <= 0) {
        throw new ValidationError(`You don't have any ${itemName} left.`);
      }

      // Decrement inventory (we'll just use Prisma directly here for simplicity, though a repo method is better)
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantity: inventoryItem.quantity - 1 }
      });

      playerAction = {
        type: 'item',
        pokemonId: session.playerActivePokemonId,
        itemId: itemName,
        ballBonus: getBallBonus(itemName)
      };
    } else {
      const moveName = action.split(':')[1];
      
      // Ensure the pokemon actually knows this move
      const playerMoves = playerPokemon.moves || [];
      if (!playerMoves.includes(moveName.toLowerCase())) {
        throw new ValidationError(`Pokemon does not know the move: ${moveName}.`);
      }

      // Fetch move from DB
      const playerMoveData = await prisma.move.findUnique({
        where: { name: moveName.toLowerCase() },
        include: { type: true }
      });

      if (!playerMoveData) {
        throw new ValidationError(`Move ${moveName} not found in database.`);
      }

      playerAction = {
        type: 'move',
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
    }

    // Wild AI logic: Just pick Tackle for now until we store moves.
    const wildMoveData = await prisma.move.findUnique({
      where: { name: 'tackle' },
      include: { type: true }
    });

    const wildAction: BattleAction = {
      type: 'move',
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
      playerPokemon,
      playerAction,
      session.wildPokemonData as any,
      wildAction
    );

    // Sync p1 state back to party data
    const p1Index = playerPartyData.findIndex(p => p.id === result.p1State.id);
    if (p1Index !== -1) playerPartyData[p1Index] = result.p1State;

    // Check if caught
    const catchEvent = result.events.find(e => e.type === 'catch_attempt') as any;
    const isCaught = catchEvent && catchEvent.success;

    // Update Session Status
    let newStatus: BattleStatus = BattleStatus.ACTIVE;
    if (isCaught) {
      newStatus = BattleStatus.CAUGHT;
    } else if (result.p1State.currentHp <= 0) {
      const hasHealthy = playerPartyData.some(p => p.currentHp > 0);
      newStatus = hasHealthy ? BattleStatus.WAITING_SWITCH : BattleStatus.LOST;
    } else if (result.p2State.currentHp <= 0) {
      newStatus = BattleStatus.WON;
    }

    if (isCaught) {
      const partyCount = trainerSave.party.length;
      const isParty = partyCount < 6;
      let boxNumber: number | null = null;
      let position = partyCount;

      if (!isParty) {
        // Send to Box 1 for now if party is full
        boxNumber = 1;
        const boxMons = await prisma.ownedPokemon.findMany({
          where: { trainerId: trainerSave.id, isParty: false, boxNumber: 1 }
        });
        position = boxMons.length;
      }

      await prisma.ownedPokemon.create({
        data: {
          trainerId: trainerSave.id,
          speciesId: wildPokemon.speciesId,
          level: wildPokemon.level,
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
    } else if (newStatus === BattleStatus.WON) {
      const { getExpYield, getLevelFromXp } = require('../../game/battle/level-math');
      const xpYield = getExpYield(wildPokemon.baseExp, wildPokemon.level);
      
      result.p1State.currentXp += xpYield;
      result.events.push({ type: 'xp_gain', pokemonId: result.p1State.id, amount: xpYield });

      const oldLevel = result.p1State.level;
      const newLevel = getLevelFromXp(result.p1State.currentXp);

      if (newLevel > oldLevel) {
        result.p1State.level = newLevel;
        // Recalculate stats? The DB will naturally re-hydrate it on next map OwnedPokemonToInstance.
        // We only need to tell the user they levelled up right now.
        // But we should update the DB currentXp and level.
        result.events.push({ type: 'level_up', pokemonId: result.p1State.id, level: newLevel });
      }

      // Actually, all pokemon in party should just be saved to DB here to persist XP and Level.
      for (const p of playerPartyData) {
        await prisma.ownedPokemon.update({
          where: { id: p.id },
          data: {
            currentXp: p.currentXp,
            level: p.level
          }
        });
      }
    }

    const updatedLog = [...(session.log as any || []), { turn: session.turnNumber, events: result.events }];

    await this.repository.updateBattleSession(session.id, {
      status: newStatus,
      turnNumber: session.turnNumber + 1,
      playerActivePokemonId: session.playerActivePokemonId,
      playerPokemonData: result.p1State as any,
      playerPartyData: playerPartyData as any,
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
