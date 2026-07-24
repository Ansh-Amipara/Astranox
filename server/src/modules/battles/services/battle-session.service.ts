import { TrainersRepository } from '../../trainers/trainers.repository';
import { ARENA_TRAINERS } from '../../../game/constants/arena-trainers';
import { BattlesRepository } from '../repositories/battles.repository';
import { NotFoundError, ValidationError } from '../../../common/errors/AppError';
import { createPokemonInstance } from '../../../game/instance/PokemonInstance';
import { mapOwnedPokemonToInstance } from '../../trainers/owned-pokemon.mapper';
import { ActivePokemon } from '../../../game/battle-state/types';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

const RANK_LEVEL_BOUNDS: Record<string, { min: number, max: number }> = {
  F_RANK: { min: 1, max: 60 },
  E_RANK: { min: 61, max: 120 },
  D_RANK: { min: 121, max: 200 },
  C_RANK: { min: 201, max: 300 },
  B_RANK: { min: 301, max: 400 },
  A_RANK: { min: 401, max: 500 },
  S_MINUS_RANK: { min: 501, max: 700 },
  S_RANK: { min: 701, max: 900 },
  S_PLUS_RANK: { min: 901, max: 1100 },
  SS_MINUS_RANK: { min: 1101, max: 1400 },
  SS_RANK: { min: 1401, max: 1700 },
  SS_PLUS_RANK: { min: 1701, max: 2000 },
  SSS_MINUS_RANK: { min: 2001, max: 3000 },
  SSS_RANK: { min: 3001, max: 4000 },
  SSS_PLUS_RANK: { min: 4001, max: 5000 },
};

function getNpcPotential(level: number): string {
  if (level <= 30) return 'BLACK_IRON';
  if (level <= 60) return 'BRONZE';
  if (level <= 90) return 'SILVER';
  if (level <= 120) return 'GOLD';
  if (level <= 160) return 'PLATINUM';
  if (level <= 200) return 'ADAMANTITE';
  if (level <= 300) return 'DIAMOND';
  if (level <= 400) return 'CRYSTAL';
  if (level <= 500) return 'EPIC';
  if (level <= 700) return 'HEROIC';
  if (level <= 900) return 'SOVEREIGN';
  if (level <= 1100) return 'LEGENDARY';
  if (level <= 1400) return 'DIVINE';
  if (level <= 1700) return 'CELESTIAL';
  if (level <= 2000) return 'PRIMORDIAL';
  if (level <= 3000) return 'MYTHICAL';
  if (level <= 4000) return 'INFINITY';
  return 'ETERNAL';
}

function toActivePokemon(inst: any): ActivePokemon {
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

export class BattleSessionService {
  private repository = new BattlesRepository();
  private trainersRepo = new TrainersRepository();

  async getArenaTrainers() {
    return ARENA_TRAINERS;
  }

  async getAvailableSpecies() {
    return prisma.species.findMany({
      select: { id: true, name: true, spriteUrl: true },
      orderBy: { id: 'asc' }
    });
  }

  async startCustomEncounter(userId: string, speciesId: number, level: number) {
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
        }
      },
      moves: []
    });

    // Populate moves dynamically from Learnset
    const learnset = await prisma.learnset.findMany({
      where: { speciesId: species.id, level: { lte: level } },
      orderBy: [{ level: 'asc' }, { learnOrder: 'asc' }],
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
      battleType: 'NPC' // Custom encounters shouldn't be capturable
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
        }
      },
      moves: []
    });

    // Populate moves dynamically from Learnset
    const learnset = await prisma.learnset.findMany({
      where: { speciesId: species.id, level: { lte: level } },
      orderBy: [{ level: 'asc' }, { learnOrder: 'asc' }],
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
        }
      },
      moves: []
    });

    if (isBoss) {
      wildInstance.maxHp *= 2;
      wildInstance.currentHp = wildInstance.maxHp;
    }

    const learnset = await prisma.learnset.findMany({
      where: { speciesId: species.id, level: { lte: level } },
      orderBy: [{ level: 'asc' }, { learnOrder: 'asc' }],
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
          }
        },
        moves: []
      });

      const learnset = await prisma.learnset.findMany({
        where: { speciesId: species.id, level: { lte: level } },
        orderBy: [{ level: 'asc' }, { learnOrder: 'asc' }],
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
          }
        },
        moves: []
      });

      const learnset = await prisma.learnset.findMany({
        where: { speciesId: species.id, level: { lte: level } },
        orderBy: [{ level: 'asc' }, { learnOrder: 'asc' }],
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
  'F_RANK': {
    name: 'F Rank Examiner',
    targetRank: 'F_RANK',
    level: 1,
    ace: 'luxio',
    team: ['pidgeotto', 'luxio'],
    coins: 300,
    xp: 1000,
    items: ['Bronze Pearl']
  },
  'E_RANK': {
    name: 'E Rank Examiner',
    targetRank: 'E_RANK',
    level: 61,
    ace: 'magmortar',
    team: ['pidgeot', 'luxray', 'magmortar'],
    coins: 1000,
    xp: 5000,
    items: ['Silver Pearl', 'Gold Pearl']
  },
  'D_RANK': {
    name: 'E Rank Examiner',
    targetRank: 'D_RANK',
    level: 121,
    ace: 'charizard',
    team: ['charizard', 'blastoise', 'venusaur', 'sceptile'],
    coins: 3000,
    xp: 15000,
    items: ['Platinum Pearl', 'Adamantite Pearl']
  },
  'C_RANK': {
    name: 'D Rank Examiner',
    targetRank: 'C_RANK',
    level: 201,
    ace: 'garchomp',
    team: ['dragonite', 'tyranitar', 'salamence', 'metagross', 'garchomp'],
    coins: 10000,
    xp: 45000,
    items: ['Diamond Pearl']
  },
  'B_RANK': {
    name: 'C Rank Examiner',
    targetRank: 'B_RANK',
    level: 301,
    ace: 'kartana',
    team: ['nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana'],
    coins: 25000,
    xp: 120000,
    items: ['Crystal Pearl']
  },
  'A_RANK': {
    name: 'B Rank Examiner',
    targetRank: 'A_RANK',
    level: 401,
    ace: 'iron-valiant',
    team: ['great-tusk', 'roaring-moon', 'iron-valiant', 'iron-thorns', 'iron-bundle', 'flutter-mane'],
    coins: 60000,
    xp: 300000,
    items: ['Epic Pearl']
  },
  'S_MINUS_RANK': {
    name: 'A Rank Examiner',
    targetRank: 'S_MINUS_RANK',
    level: 501,
    ace: 'zapdos',
    team: ['articuno', 'zapdos', 'moltres', 'raikou', 'entei', 'suicune'],
    coins: 150000,
    xp: 750000,
    items: []
  },
  'S_RANK': {
    name: 'S- Rank Examiner',
    targetRank: 'S_RANK',
    level: 701,
    ace: 'regieleki',
    team: ['latios', 'latias', 'heatran', 'cresselia', 'regieleki', 'regidrago'],
    coins: 400000,
    xp: 1800000,
    items: []
  },
  'S_PLUS_RANK': {
    name: 'S Rank Examiner',
    targetRank: 'S_PLUS_RANK',
    level: 901,
    ace: 'ogerpon',
    team: ['tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini', 'ogerpon', 'urshifu-single-strike'],
    coins: 1000000,
    xp: 4000000,
    items: []
  },
  'SS_MINUS_RANK': {
    name: 'S+ Rank Examiner',
    targetRank: 'SS_MINUS_RANK',
    level: 1101,
    ace: 'deoxys-normal',
    team: ['deoxys-normal', 'darkrai', 'genesect', 'keldeo-ordinary', 'diancie', 'volcanion'],
    coins: 2500000,
    xp: 10000000,
    items: []
  },
  'SS_RANK': {
    name: 'SS- Rank Examiner',
    targetRank: 'SS_RANK',
    level: 1401,
    ace: 'marshadow',
    team: ['marshadow', 'zeraora', 'victini', 'melmetal', 'zarude', 'mew'],
    coins: 6000000,
    xp: 25000000,
    items: []
  },
  'SS_PLUS_RANK': {
    name: 'SS Rank Examiner',
    targetRank: 'SS_PLUS_RANK',
    level: 1701,
    ace: 'deoxys-normal',
    team: ['deoxys-normal', 'darkrai', 'marshadow', 'zeraora', 'melmetal', 'genesect'],
    coins: 15000000,
    xp: 60000000,
    items: []
  },
  'SSS_MINUS_RANK': {
    name: 'SS+ Rank Examiner',
    targetRank: 'SSS_MINUS_RANK',
    level: 2001,
    ace: 'giratina-altered',
    team: ['groudon', 'kyogre', 'dialga', 'palkia', 'giratina-altered', 'reshiram'],
    coins: 40000000,
    xp: 150000000,
    items: []
  },
  'SSS_RANK': {
    name: 'SSS- Rank Examiner',
    targetRank: 'SSS_RANK',
    level: 3001,
    ace: 'koraidon',
    team: ['zekrom', 'solgaleo', 'lunala', 'koraidon', 'miraidon', 'calyrex'],
    coins: 100000000,
    xp: 300000000,
    items: []
  },
  'SSS_PLUS_RANK': {
    name: 'SSS Rank Examiner',
    targetRank: 'SSS_PLUS_RANK',
    level: 4001,
    ace: 'zacian',
    team: ['xerneas', 'yveltal', 'lugia', 'ho-oh', 'zacian', 'zamazenta'],
    coins: 250000000,
    xp: 600000000,
    items: []
  }
};
