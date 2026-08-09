import { injectable } from 'tsyringe';
import { TrainersRepository } from '../../trainers/trainers.repository';
import { ARENA_TRAINERS } from '../../../game/constants/arena-trainers';
import { BattlesRepository } from '../repositories/battles.repository';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { createPokemonInstance } from '../../../game/instance/PokemonInstance';
import { mapOwnedPokemonToInstance } from '../../trainers/owned-pokemon.mapper';
import { ActivePokemon } from '../../../game/battle-state/types';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../../core/db/prisma';



function generateWildIVs() {
  return {
    hp: Math.floor(Math.random() * 32),
    attack: Math.floor(Math.random() * 32),
    defense: Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    speed: Math.floor(Math.random() * 32),
  };
}

import { getMinPotentialForLevel, getMaxLevelForPotential } from '../../../game/instance/PokemonInstance';

const RANK_LEVEL_BOUNDS: Record<string, { min: number, max: number }> = {
  F_MINUS: { min: 1, max: 25 },
  F: { min: 26, max: 50 },
  F_PLUS: { min: 51, max: 75 },
  E_MINUS: { min: 76, max: 100 },
  E: { min: 101, max: 150 },
  E_PLUS: { min: 151, max: 200 },
  D_MINUS: { min: 201, max: 300 },
  D: { min: 301, max: 400 },
  D_PLUS: { min: 401, max: 500 },
  C_MINUS: { min: 501, max: 600 },
  C: { min: 601, max: 700 },
  C_PLUS: { min: 701, max: 800 },
  B_MINUS: { min: 801, max: 1000 },
  B: { min: 1001, max: 1200 },
  B_PLUS: { min: 1201, max: 1400 },
  A_MINUS: { min: 1401, max: 1600 },
  A: { min: 1601, max: 1800 },
  A_PLUS: { min: 1801, max: 2000 },
  S_MINUS: { min: 2001, max: 3000 },
  S: { min: 3001, max: 4000 },
  S_PLUS: { min: 4001, max: 5000 },
  SS_MINUS: { min: 5001, max: 6000 },
  SS: { min: 6001, max: 7000 },
  SS_PLUS: { min: 7001, max: 8000 },
  SSS_MINUS: { min: 8001, max: 10000 },
  SSS: { min: 10001, max: 12000 },
  SSS_PLUS: { min: 12001, max: 14000 },
  EX_MINUS: { min: 14001, max: 16000 },
  EX: { min: 16001, max: 18000 },
  EX_PLUS: { min: 18001, max: 20000 },
};

function getNpcPotential(level: number): string {
  return getMinPotentialForLevel(level);
}

export function toActivePokemon(inst: any): ActivePokemon {
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
    catchRate: inst.species.catchRate || 255,
    baseExp: inst.species.baseExp || 100,
    currentXp: inst.currentXp || 0,
    status: null,
    stages: { attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 }
  };
}

@injectable()
export class BattleSessionService {
  constructor(
    private repository: BattlesRepository,
    private trainersRepo: TrainersRepository
  ) {}

  async getArenaTrainers() {
    return ARENA_TRAINERS;
  }

  async getAvailableSpecies() {
    return prisma.species.findMany({
      select: { id: true, name: true, spriteUrl: true },
      orderBy: { id: 'asc' }
    });
  }

  async startCustomEncounter(userId: string, speciesId: number, level: number, battleType?: any) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found');
    }
    const trainerId = trainerSave.id;

    // 1. Check if user already in battle
    const active = await this.repository.getActiveBattleByTrainer(trainerId);
    if (active) {
      throw new ValidationError('You are already in a battle.');
    }

    const species = await prisma.species.findUnique({
      where: { id: speciesId },
      include: { type1: true, type2: true }
    });

    if (!species) {
      throw new NotFoundError('Species not found.');
    }

    const ivs = generateWildIVs();

    // Construct wild PokemonInstance
    const types = [species.type1.name];
    if (species.type2) types.push(species.type2.name);
    
    const wildInstance = createPokemonInstance({
      id: crypto.randomUUID(),
      nickname: species.name,
      level: level,
      potential: getNpcPotential(level),
      ivs,
      species: {
        id: species.id,
        name: species.name,
        types,
        baseStats: {
          hp: species.hp,
          attack: species.attack,
          defense: species.defense,
          spAtk: species.spAtk,
          spDef: species.spDef,
          speed: species.speed
        },
        isGmax: species.isGmax
      },
      moves: []
    });

    // Populate moves dynamically from Learnset
    const learnset = await prisma.pokemonLearnset.findMany({
      where: { speciesId: species.id, unlockLevel: { lte: level } },
      orderBy: { unlockLevel: 'asc' },
      include: { move: { include: { type: true } } }
    });

    const uniqueMoves: any[] = [];
    const seen = new Set();
    for (let i = learnset.length - 1; i >= 0; i--) {
      if (!seen.has(learnset[i].moveId)) {
        seen.add(learnset[i].moveId);
        uniqueMoves.unshift(learnset[i]);
      }
    }

    const latestMoves = uniqueMoves.slice(-4);
    wildInstance.moves = latestMoves.map((m: any, i: number) => ({
      moveId: m.moveId,
      currentSlot: i,
      name: m.move.name,
      type: m.move.type.name
    }));

    const wildActive = toActivePokemon(wildInstance);

    // 3. Get player lead Pokemon
    if (trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokemon to battle with!');
    }
    const lead = trainerSave.party[0]; 
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);

    // 4. Create BattleSession
    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.repository.createBattleSession({
      trainerId,
      playerActivePokemonId: playerActive.id,
      opponentPokemonData: wildActive,
      playerPokemonData: playerActive,
      playerPartyData,
      battleType: battleType || 'NPC' // Default to NPC for standard custom encounters
    });

    return {
      encounter: {
        species: species,
        level: level,
        potential: getNpcPotential(level)
      },
      battleSession: session
    };
  }

  async startRealmEncounter(userId: string, realmId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found');
    }
    const trainerId = trainerSave.id;

    const active = await this.repository.getActiveBattleByTrainer(trainerId);
    if (active) {
      throw new ValidationError('You are already in a battle.');
    }

    const realm = await (prisma as any).astralRealm.findUnique({ where: { id: realmId } });
    if (!realm) {
      throw new NotFoundError('Realm not found.');
    }

    // 1. Determine encountered species
    let encounteredSpeciesName = '';
    
    // Roll for legendary
    const legendaries = realm.legendarySpawns as any[];
    if (legendaries && legendaries.length > 0) {
      const roll = Math.random();
      // Calculate total legendary chance. E.g. multiple legendaries of same tier.
      // Wait, the prompt says "chance to hit the Tier 3 pool, followed by 50/50". 
      // But our legendarySpawns already maps individual chances. We can just roll once against the sum.
      let cumulativeChance = 0;
      for (const leg of legendaries) {
        cumulativeChance += leg.chance;
        if (roll <= cumulativeChance) {
          encounteredSpeciesName = leg.name;
          break;
        }
      }
    }

    // If no legendary rolled, pick from standard habitat
    if (!encounteredSpeciesName && realm.habitats && realm.habitats.length > 0) {
      const randomIndex = Math.floor(Math.random() * realm.habitats.length);
      encounteredSpeciesName = realm.habitats[randomIndex];
    } else if (!encounteredSpeciesName) {
      // Fallback if realm has no habitat yet
      encounteredSpeciesName = 'pikachu';
    }

    const species = await prisma.species.findUnique({
      where: { name: encounteredSpeciesName.toLowerCase() },
      include: { type1: true, type2: true }
    });

    if (!species) {
      throw new NotFoundError(`Species ${encounteredSpeciesName} not found in database.`);
    }

    // 2. Determine Level and Potential based on realm's requiredRank
    const rankBounds = (RANK_LEVEL_BOUNDS as any)[realm.requiredRank] || { min: 1, max: 5 };
    const level = Math.floor(Math.random() * (rankBounds.max - rankBounds.min + 1)) + rankBounds.min;

    const ivs = generateWildIVs();

    const types = [species.type1.name];
    if (species.type2) types.push(species.type2.name);
    
    const wildInstance = createPokemonInstance({
      id: crypto.randomUUID(),
      nickname: species.name,
      level: level,
      potential: getNpcPotential(level),
      ivs,
      species: {
        id: species.id,
        name: species.name,
        types,
        baseStats: {
          hp: species.hp,
          attack: species.attack,
          defense: species.defense,
          spAtk: species.spAtk,
          spDef: species.spDef,
          speed: species.speed
        },
        isGmax: species.isGmax
      },
      moves: []
    });

    // Populate moves dynamically from Learnset
    const learnset = await prisma.pokemonLearnset.findMany({
      where: { speciesId: species.id, unlockLevel: { lte: level } },
      orderBy: { unlockLevel: 'asc' },
      include: { move: { include: { type: true } } }
    });

    const uniqueMoves: any[] = [];
    const seen = new Set();
    for (let i = learnset.length - 1; i >= 0; i--) {
      if (!seen.has(learnset[i].moveId)) {
        seen.add(learnset[i].moveId);
        uniqueMoves.unshift(learnset[i]);
      }
    }

    const latestMoves = uniqueMoves.slice(-4);
    wildInstance.moves = latestMoves.map((m: any, i: number) => ({
      moveId: m.moveId,
      currentSlot: i,
      name: m.move.name,
      type: m.move.type.name
    }));

    const wildActive = toActivePokemon(wildInstance);

    // 3. Get player lead Pokemon
    if (trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokemon to battle with!');
    }
    const lead = trainerSave.party[0]; 
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);

    // 4. Create BattleSession
    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.repository.createBattleSession({
      trainerId,
      playerActivePokemonId: playerActive.id,
      opponentPokemonData: wildActive,
      playerPokemonData: playerActive,
      playerPartyData,
      battleType: 'WILD' // Realm encounters are wild
    });

    return {
      encounter: {
        species: species,
        level: level,
        potential: getNpcPotential(level)
      },
      battleSession: session
    };
  }

  async startSecretRealmEncounter(userId: string, speciesId: number, level: number, potential: string, isBoss: boolean = false) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer save not found');

    const active = await this.repository.getActiveBattleByTrainer(trainerSave.id);
    if (active) throw new ValidationError('You are already in a battle.');

    const species = await prisma.species.findUnique({
      where: { id: speciesId },
      include: { type1: true, type2: true }
    });

    if (!species) throw new NotFoundError('Species not found.');

    const ivs = generateWildIVs();

    const types = [species.type1.name];
    if (species.type2) types.push(species.type2.name);
    
    const wildInstance = createPokemonInstance({
      id: crypto.randomUUID(),
      nickname: isBoss ? `Alpha ${species.name}` : species.name,
      level: level,
      potential: potential, // Dynamic potential from our realm rules
      ivs,
      species: {
        id: species.id,
        name: species.name,
        types,
        baseStats: {
          hp: species.hp,
          attack: species.attack,
          defense: species.defense,
          spAtk: species.spAtk,
          spDef: species.spDef,
          speed: species.speed
        },
        isGmax: species.isGmax
      },
      moves: []
    });

    if (isBoss) {
      wildInstance.maxHp *= 2;
      wildInstance.currentHp = wildInstance.maxHp;
    }

    const learnset = await prisma.pokemonLearnset.findMany({
      where: { speciesId: species.id, unlockLevel: { lte: level } },
      orderBy: { unlockLevel: 'asc' },
      include: { move: { include: { type: true } } }
    });

    const uniqueMoves: any[] = [];
    const seen = new Set();
    for (let i = learnset.length - 1; i >= 0; i--) {
      if (!seen.has(learnset[i].moveId)) {
        seen.add(learnset[i].moveId);
        uniqueMoves.unshift(learnset[i]);
      }
    }

    const latestMoves = uniqueMoves.slice(-4);
    wildInstance.moves = latestMoves.map((m: any, i: number) => ({
      moveId: m.moveId,
      currentSlot: i,
      name: m.move.name,
      type: m.move.type.name
    }));

    const wildActive = toActivePokemon(wildInstance);

    if (trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokemon to battle with!');
    }
    const lead = trainerSave.party[0];
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);

    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.repository.createBattleSession({
      trainerId: trainerSave.id,
      playerActivePokemonId: playerActive.id,
      opponentPokemonData: wildActive,
      playerPokemonData: playerActive,
      playerPartyData,
      battleType: isBoss ? 'NPC' : 'WILD' // Use NPC for boss to prevent catching
    });

    return {
      encounter: {
        species: species,
        level: level,
        potential: potential
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

  async startRankExamEncounter(userId: string, targetRank: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found');
    }
    const trainerId = trainerSave.id;

    const active = await this.repository.getActiveBattleByTrainer(trainerId);
    if (active) {
      throw new ValidationError('You are already in a battle.');
    }

    const config = RANK_EXAMINERS[targetRank];
    if (!config) {
      throw new ValidationError(`No examiner configured for rank ${targetRank}`);
    }

    const level = config.level;
    const opponentPartyData: any[] = [];

    for (const speciesName of config.team) {
      const cleanName = speciesName.toLowerCase();
      let species = await prisma.species.findFirst({
        where: {
          OR: [
            { name: cleanName },
            { name: cleanName.replace(/-/g, '') },
            { name: { startsWith: cleanName.split('-')[0] } }
          ]
        },
        include: { type1: true, type2: true }
      });

      if (!species) {
        species = await prisma.species.findFirst({
          where: { name: 'pikachu' },
          include: { type1: true, type2: true }
        });
      }

      if (!species) continue;

      const ivs = generateWildIVs();
      const types = [species.type1.name];
      if (species.type2) types.push(species.type2.name);

      const inst = createPokemonInstance({
        id: crypto.randomUUID(),
        nickname: species.name.toUpperCase(),
        level,
        potential: getNpcPotential(level),
        ivs,
        species: {
          id: species.id,
          name: species.name,
          types,
          baseStats: {
            hp: species.hp,
            attack: species.attack,
            defense: species.defense,
            spAtk: species.spAtk,
            spDef: species.spDef,
            speed: species.speed
          },
          isGmax: species.isGmax
        },
        moves: []
      });

      const learnset = await prisma.pokemonLearnset.findMany({
        where: { speciesId: species.id, unlockLevel: { lte: level } },
        orderBy: { unlockLevel: 'asc' },
        include: { move: { include: { type: true } } }
      });

      const uniqueMoves: any[] = [];
      const seen = new Set();
      for (let i = learnset.length - 1; i >= 0; i--) {
        if (!seen.has(learnset[i].moveId)) {
          seen.add(learnset[i].moveId);
          uniqueMoves.unshift(learnset[i]);
        }
      }

      const latestMoves = uniqueMoves.slice(-4);
      inst.moves = latestMoves.map((m: any, i: number) => ({
        moveId: m.moveId,
        currentSlot: i,
        name: m.move.name,
        type: m.move.type.name
      }));

      const activeMon = toActivePokemon(inst);
      (activeMon as any).isRankExam = true;
      (activeMon as any).targetRank = targetRank;
      (activeMon as any).examinerName = config.name;
      (activeMon as any).examinerCoins = config.coins;
      (activeMon as any).examinerItems = config.items;

      opponentPartyData.push(activeMon);
    }

    if (opponentPartyData.length === 0) {
      throw new ValidationError('Failed to generate Rank Examiner team.');
    }

    const leadOpponent = opponentPartyData[0];

    if (trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokemon to battle with!');
    }
    const lead = trainerSave.party[0];
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);
    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.repository.createBattleSession({
      trainerId,
      playerActivePokemonId: playerActive.id,
      opponentPokemonData: leadOpponent,
      playerPokemonData: playerActive,
      playerPartyData,
      opponentPartyData,
      battleType: 'NPC'
    });

    return session;
  }

  async startArenaEncounter(userId: string, trainerId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found');
    }

    const active = await this.repository.getActiveBattleByTrainer(trainerSave.id);
    if (active) {
      throw new ValidationError('You are already in a battle.');
    }

    const config = ARENA_TRAINERS.find(t => t.id === trainerId);
    if (!config) {
      throw new NotFoundError(`Arena trainer not found.`);
    }

    const level = config.level;
    const opponentPartyData: any[] = [];

    for (const speciesName of config.team) {
      const cleanName = speciesName.toLowerCase();
      let species = await prisma.species.findFirst({
        where: {
          OR: [
            { name: cleanName },
            { name: cleanName.replace(/-/g, '') },
            { name: { startsWith: cleanName.split('-')[0] } }
          ]
        },
        include: { type1: true, type2: true }
      });

      if (!species) {
        species = await prisma.species.findFirst({
          where: { name: 'pikachu' },
          include: { type1: true, type2: true }
        });
      }

      if (!species) continue;

      const ivs = generateWildIVs();
      const types = [species.type1.name];
      if (species.type2) types.push(species.type2.name);

      const inst = createPokemonInstance({
        id: crypto.randomUUID(),
        nickname: species.name.toUpperCase(),
        level,
        potential: getNpcPotential(level),
        ivs,
        species: {
          id: species.id,
          name: species.name,
          types,
          baseStats: {
            hp: species.hp,
            attack: species.attack,
            defense: species.defense,
            spAtk: species.spAtk,
            spDef: species.spDef,
            speed: species.speed
          },
          isGmax: species.isGmax
        },
        moves: []
      });

      const learnset = await prisma.pokemonLearnset.findMany({
        where: { speciesId: species.id, unlockLevel: { lte: level } },
        orderBy: { unlockLevel: 'asc' },
        include: { move: { include: { type: true } } }
      });

      const uniqueMoves: any[] = [];
      const seen = new Set();
      for (let i = learnset.length - 1; i >= 0; i--) {
        if (!seen.has(learnset[i].moveId)) {
          seen.add(learnset[i].moveId);
          uniqueMoves.unshift(learnset[i]);
        }
      }

      const latestMoves = uniqueMoves.slice(-4);
      inst.moves = latestMoves.map((m: any, i: number) => ({
        moveId: m.moveId,
        currentSlot: i,
        name: m.move.name,
        type: m.move.type.name
      }));

      const activeMon = toActivePokemon(inst);
      (activeMon as any).isArenaBattle = true;
      (activeMon as any).examinerName = config.name;
      (activeMon as any).examinerCoins = config.coins;
      (activeMon as any).targetRank = config.targetRank; // for XP calculation context if needed

      opponentPartyData.push(activeMon);
    }

    if (opponentPartyData.length === 0) {
      throw new ValidationError('Failed to generate Arena Trainer team.');
    }

    const leadOpponent = opponentPartyData[0];

    if (trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokemon to battle with!');
    }
    const lead = trainerSave.party[0];
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);
    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.repository.createBattleSession({
      trainerId: trainerSave.id,
      playerActivePokemonId: playerActive.id,
      opponentPokemonData: leadOpponent,
      playerPokemonData: playerActive,
      playerPartyData,
      opponentPartyData,
      battleType: 'NPC'
    });

    return session;
  }
}

export const RANK_EXAMINERS: Record<string, {
  name: string;
  targetRank: string;
  level: number;
  ace: string;
  team: string[];
  coins: number;
  xp: number;
  items: string[];
}> = {
  'F_MINUS': {
    name: 'F- Rank Examiner',
    targetRank: 'F_MINUS',
    level: 1,
    ace: 'stunky',
    team: ['smoochum','stunky'],
    coins: 150,
    xp: 500,
    items: ['Bronze Pearl']
  },
  'F': {
    name: 'F Rank Examiner',
    targetRank: 'F',
    level: 11,
    ace: 'pawmi',
    team: ['primarina','pawmi'],
    coins: 300,
    xp: 1000,
    items: ['Bronze Pearl']
  },
  'F_PLUS': {
    name: 'F+ Rank Examiner',
    targetRank: 'F_PLUS',
    level: 31,
    ace: 'tatsugiri-stretchy-mega',
    team: ['archaludon','tatsugiri-stretchy-mega'],
    coins: 500,
    xp: 2000,
    items: ['Bronze Pearl']
  },
  'E_MINUS': {
    name: 'E- Rank Examiner',
    targetRank: 'E_MINUS',
    level: 45,
    ace: 'honedge',
    team: ['orbeetle-gmax','litwick','honedge'],
    coins: 700,
    xp: 3000,
    items: ['Silver Pearl','Gold Pearl']
  },
  'E': {
    name: 'E Rank Examiner',
    targetRank: 'E',
    level: 61,
    ace: 'plusle',
    team: ['lapras-gmax','gothita','plusle'],
    coins: 1000,
    xp: 5000,
    items: ['Silver Pearl','Gold Pearl']
  },
  'E_PLUS': {
    name: 'E+ Rank Examiner',
    targetRank: 'E_PLUS',
    level: 91,
    ace: 'spidops',
    team: ['slurpuff','anorith','spidops'],
    coins: 1500,
    xp: 8000,
    items: ['Silver Pearl','Gold Pearl']
  },
  'D_MINUS': {
    name: 'D- Rank Examiner',
    targetRank: 'D_MINUS',
    level: 105,
    ace: 'caterpie',
    team: ['yamper','grapploct','wishiwashi-solo','caterpie'],
    coins: 2000,
    xp: 11000,
    items: ['Platinum Pearl','Adamantite Pearl']
  },
  'D': {
    name: 'D Rank Examiner',
    targetRank: 'D',
    level: 121,
    ace: 'tarountula',
    team: ['wormadam-plant','caterpie','rotom-wash','tarountula'],
    coins: 3000,
    xp: 15000,
    items: ['Platinum Pearl','Adamantite Pearl']
  },
  'D_PLUS': {
    name: 'D+ Rank Examiner',
    targetRank: 'D_PLUS',
    level: 161,
    ace: 'corvisquire',
    team: ['cramorant-gorging','furret','pikachu-belle','corvisquire'],
    coins: 5000,
    xp: 25000,
    items: ['Platinum Pearl','Adamantite Pearl']
  },
  'C_MINUS': {
    name: 'C- Rank Examiner',
    targetRank: 'C_MINUS',
    level: 181,
    ace: 'mudkip',
    team: ['cutiefly','pawmi','joltik','corsola','mudkip'],
    coins: 7000,
    xp: 35000,
    items: ['Diamond Pearl']
  },
  'C': {
    name: 'C Rank Examiner',
    targetRank: 'C',
    level: 201,
    ace: 'vulpix',
    team: ['typhlosion','shroomish','floette-eternal','nuzleaf','vulpix'],
    coins: 10000,
    xp: 45000,
    items: ['Diamond Pearl']
  },
  'C_PLUS': {
    name: 'C+ Rank Examiner',
    targetRank: 'C_PLUS',
    level: 251,
    ace: 'gligar',
    team: ['mimikyu-busted','persian','cetoddle','tatsugiri-curly-mega','gligar'],
    coins: 15000,
    xp: 70000,
    items: ['Diamond Pearl']
  },
  'B_MINUS': {
    name: 'B- Rank Examiner',
    targetRank: 'B_MINUS',
    level: 275,
    ace: 'shieldon',
    team: ['crabominable-mega','horsea','minior-indigo-meteor','venusaur-mega','vigoroth','shieldon'],
    coins: 20000,
    xp: 90000,
    items: ['Crystal Pearl']
  },
  'B': {
    name: 'B Rank Examiner',
    targetRank: 'B',
    level: 301,
    ace: 'kingler-gmax',
    team: ['durant','lucario-mega-z','greninja-battle-bond','typhlosion-hisui','gholdengo','kingler-gmax'],
    coins: 25000,
    xp: 120000,
    items: ['Crystal Pearl']
  },
  'B_PLUS': {
    name: 'B+ Rank Examiner',
    targetRank: 'B_PLUS',
    level: 351,
    ace: 'morgrem',
    team: ['carbink','snover','pyukumuku','poliwhirl','gothorita','morgrem'],
    coins: 35000,
    xp: 175000,
    items: ['Crystal Pearl']
  },
  'A_MINUS': {
    name: 'A- Rank Examiner',
    targetRank: 'A_MINUS',
    level: 375,
    ace: 'charizard',
    team: ['sharpedo-mega','stunfisk-galar','magnezone','gardevoir-mega','carnivine','charizard'],
    coins: 45000,
    xp: 230000,
    items: ['Epic Pearl']
  },
  'A': {
    name: 'A Rank Examiner',
    targetRank: 'A',
    level: 401,
    ace: 'klang',
    team: ['staravia','abomasnow','seadra','squawkabilly-yellow-plumage','aron','klang'],
    coins: 60000,
    xp: 300000,
    items: ['Epic Pearl']
  },
  'A_PLUS': {
    name: 'A+ Rank Examiner',
    targetRank: 'A_PLUS',
    level: 451,
    ace: 'slugma',
    team: ['galvantula','sinistea','gulpin','tyrogue','smeargle','slugma'],
    coins: 100000,
    xp: 500000,
    items: ['Epic Pearl']
  },
  'S_MINUS': {
    name: 'S- Rank Examiner',
    targetRank: 'S_MINUS',
    level: 501,
    ace: 'xurkitree',
    team: ['iron-moth','deoxys-attack','volcanion','celesteela','salamence','xurkitree'],
    coins: 150000,
    xp: 750000,
    items: []
  },
  'S': {
    name: 'S Rank Examiner',
    targetRank: 'S',
    level: 701,
    ace: 'salamence',
    team: ['tyranitar-mega','kubfu','dragonair','giratina-altered','tornadus-incarnate','salamence'],
    coins: 400000,
    xp: 1800000,
    items: []
  },
  'S_PLUS': {
    name: 'S+ Rank Examiner',
    targetRank: 'S_PLUS',
    level: 901,
    ace: 'type-null',
    team: ['sliggoo','kommo-o-totem','salamence','keldeo-resolute','tornadus-therian','type-null'],
    coins: 1000000,
    xp: 4000000,
    items: []
  },
  'SS_MINUS': {
    name: 'SS- Rank Examiner',
    targetRank: 'SS_MINUS',
    level: 1101,
    ace: 'landorus-incarnate',
    team: ['heatran','pecharunt','darkrai','spectrier','tapu-bulu','landorus-incarnate'],
    coins: 2500000,
    xp: 10000000,
    items: []
  },
  'SS': {
    name: 'SS Rank Examiner',
    targetRank: 'SS',
    level: 1401,
    ace: 'darkrai',
    team: ['registeel','ogerpon-wellspring-mask','zygarde-complete','meltan','terapagos-terastal','darkrai'],
    coins: 6000000,
    xp: 25000000,
    items: []
  },
  'SS_PLUS': {
    name: 'SS+ Rank Examiner',
    targetRank: 'SS_PLUS',
    level: 1701,
    ace: 'kommo-o',
    team: ['guzzlord','beldum','garchomp-mega-z','dragonite-mega','zygarde-complete','kommo-o'],
    coins: 15000000,
    xp: 60000000,
    items: []
  },
  'SSS_MINUS': {
    name: 'SSS- Rank Examiner',
    targetRank: 'SSS_MINUS',
    level: 2001,
    ace: 'thundurus-incarnate',
    team: ['iron-thorns','raikou','darkrai','melmetal-gmax','tornadus-incarnate','thundurus-incarnate'],
    coins: 40000000,
    xp: 150000000,
    items: []
  },
  'SSS': {
    name: 'SSS Rank Examiner',
    targetRank: 'SSS',
    level: 3001,
    ace: 'ogerpon-wellspring-mask',
    team: ['munkidori','zarude','regirock','registeel','thundurus-therian','ogerpon-wellspring-mask'],
    coins: 100000000,
    xp: 300000000,
    items: []
  },
  'SSS_PLUS': {
    name: 'SSS+ Rank Examiner',
    targetRank: 'SSS_PLUS',
    level: 4001,
    ace: 'thundurus-incarnate',
    team: ['keldeo-resolute','zapdos-galar','tapu-fini','iron-jugulis','garchomp-mega-z','thundurus-incarnate'],
    coins: 250000000,
    xp: 600000000,
    items: []
  },
  'EX_MINUS': {
    name: 'EX- Rank Examiner',
    targetRank: 'EX_MINUS',
    level: 5001,
    ace: 'regigigas',
    team: ['solgaleo','yveltal','zamazenta-crowned','zekrom','lunala','regigigas'],
    coins: 600000000,
    xp: 1500000000,
    items: []
  },
  'EX': {
    name: 'EX Rank Examiner',
    targetRank: 'EX',
    level: 7001,
    ace: 'koraidon',
    team: ['groudon-primal','kyogre-primal','lugia','kyogre','yveltal','koraidon'],
    coins: 1500000000,
    xp: 4000000000,
    items: []
  },
  'EX_PLUS': {
    name: 'EX+ Rank Examiner',
    targetRank: 'EX_PLUS',
    level: 9999,
    ace: 'zacian-crowned',
    team: ['zacian','calyrex-ice','yveltal','zamazenta-crowned','ho-oh','zacian-crowned'],
    coins: 5000000000,
    xp: 15000000000,
    items: []
  }
};
