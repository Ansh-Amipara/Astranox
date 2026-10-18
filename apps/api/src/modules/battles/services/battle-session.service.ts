import { injectable } from 'tsyringe';
import { TrainersRepository } from '../../trainers/trainers.repository';
import { ARENA_TRAINERS } from '../../../game/constants/arena-trainers';
import { BattlesRepository } from '../repositories/battles.repository';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { createPokemonInstance } from '../../../game/instance/PokemonInstance';
import { mapOwnedPokemonToInstance } from '../../trainers/owned-pokemon.mapper';
import { ActivePokemon } from '../../../game/battle-state/types';
import crypto from 'crypto';
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

import { getMinPotentialForLevel } from '../../../game/instance/PokemonInstance';

const RANK_LEVEL_BOUNDS: Record<string, { min: number, max: number }> = {
  F: { min: 1, max: 25 },
  E: { min: 26, max: 50 },
  D: { min: 51, max: 75 },
  C: { min: 76, max: 100 },
  B: { min: 101, max: 150 },
  A: { min: 151, max: 200 },
  S_MINUS: { min: 201, max: 300 },
  S: { min: 301, max: 350 },
  S_PLUS: { min: 351, max: 400 },
  SS_MINUS: { min: 401, max: 500 },
  SS: { min: 501, max: 600 },
  SS_PLUS: { min: 601, max: 700 },
  SSS_MINUS: { min: 701, max: 800 },
  SSS: { min: 801, max: 900 },
  SSS_PLUS: { min: 901, max: 1000 },
  EX: { min: 1001, max: 5000 },
};

function getNpcPotential(level: number): string {
  return getMinPotentialForLevel(level);
}

export function toActivePokemon(inst: any): ActivePokemon {
  return {
    id: inst.id,
    speciesId: inst.species.id,
    speciesName: inst.species.name,
    level: inst.level,
    potential: inst.potential,
    types: inst.types,
    moves: inst.moves,
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
    const custom = await prisma.arenaTrainer.findMany({
      where: { isArchived: false, enabled: true },
      orderBy: [{ sortOrder: 'asc' }, { level: 'asc' }],
    });
    if (custom.length > 0) {
      return custom.map(t => ({
        id: t.key,
        name: t.name,
        targetRank: t.targetRank,
        level: t.level,
        team: t.team,
        coins: t.coins,
        xp: t.xp,
        theme: t.theme,
      }));
    }
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

    const dbRank = await prisma.rankDefinition.findUnique({
      where: { rank: targetRank as any },
    });
    const config = dbRank
      ? {
          name: dbRank.examinerName,
          targetRank: dbRank.rank,
          level: dbRank.examinerLevel,
          ace: dbRank.examinerAce,
          team: dbRank.examinerTeam,
          coins: dbRank.rewardCoins,
          xp: dbRank.rewardXp,
          items: dbRank.rewardItems,
        }
      : RANK_EXAMINERS[targetRank];

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

    const dbTrainer = await prisma.arenaTrainer.findUnique({
      where: { key: trainerId },
    });
    const config = dbTrainer
      ? {
          id: dbTrainer.key,
          name: dbTrainer.name,
          targetRank: dbTrainer.targetRank,
          level: dbTrainer.level,
          team: dbTrainer.team,
          coins: dbTrainer.coins,
          xp: dbTrainer.xp,
          theme: dbTrainer.theme,
        }
      : ARENA_TRAINERS.find(t => t.id === trainerId);

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
  'F': {
    name: 'F Rank Examiner',
    targetRank: 'F',
    level: 1,
    ace: 'pawmi',
    team: ['primarina','pawmi'],
    coins: 300,
    xp: 1000,
    items: ['Bronze Pearl']
  },
  'E': {
    name: 'E Rank Examiner',
    targetRank: 'E',
    level: 26,
    ace: 'honedge',
    team: ['orbeetle-gmax','litwick','honedge'],
    coins: 700,
    xp: 3000,
    items: ['Silver Pearl','Gold Pearl']
  },
  'D': {
    name: 'D Rank Examiner',
    targetRank: 'D',
    level: 51,
    ace: 'caterpie',
    team: ['yamper','grapploct','wishiwashi-solo','caterpie'],
    coins: 2000,
    xp: 11000,
    items: ['Platinum Pearl','Adamantite Pearl']
  },
  'C': {
    name: 'C Rank Examiner',
    targetRank: 'C',
    level: 76,
    ace: 'mudkip',
    team: ['cutiefly','pawmi','joltik','corsola','mudkip'],
    coins: 7000,
    xp: 35000,
    items: ['Diamond Pearl']
  },
  'B': {
    name: 'B Rank Examiner',
    targetRank: 'B',
    level: 101,
    ace: 'shieldon',
    team: ['crabominable-mega','horsea','minior-indigo-meteor','venusaur-mega','vigoroth','shieldon'],
    coins: 20000,
    xp: 90000,
    items: ['Crystal Pearl']
  },
  'A': {
    name: 'A Rank Examiner',
    targetRank: 'A',
    level: 151,
    ace: 'charizard',
    team: ['sharpedo-mega','stunfisk-galar','magnezone','gardevoir-mega','carnivine','charizard'],
    coins: 45000,
    xp: 230000,
    items: ['Epic Pearl']
  },
  'S_MINUS': {
    name: 'S- Rank Examiner',
    targetRank: 'S_MINUS',
    level: 201,
    ace: 'xurkitree',
    team: ['iron-moth','deoxys-attack','volcanion','celesteela','salamence','xurkitree'],
    coins: 150000,
    xp: 750000,
    items: []
  },
  'S': {
    name: 'S Rank Examiner',
    targetRank: 'S',
    level: 301,
    ace: 'salamence',
    team: ['tyranitar-mega','kubfu','dragonair','giratina-altered','tornadus-incarnate','salamence'],
    coins: 400000,
    xp: 1800000,
    items: []
  },
  'S_PLUS': {
    name: 'S+ Rank Examiner',
    targetRank: 'S_PLUS',
    level: 351,
    ace: 'type-null',
    team: ['sliggoo','kommo-o-totem','salamence','keldeo-resolute','tornadus-therian','type-null'],
    coins: 1000000,
    xp: 4000000,
    items: []
  },
  'SS_MINUS': {
    name: 'SS- Rank Examiner',
    targetRank: 'SS_MINUS',
    level: 401,
    ace: 'landorus-incarnate',
    team: ['heatran','pecharunt','darkrai','spectrier','tapu-bulu','landorus-incarnate'],
    coins: 2500000,
    xp: 10000000,
    items: []
  },
  'SS': {
    name: 'SS Rank Examiner',
    targetRank: 'SS',
    level: 501,
    ace: 'darkrai',
    team: ['registeel','ogerpon-wellspring-mask','zygarde-complete','meltan','terapagos-terastal','darkrai'],
    coins: 6000000,
    xp: 25000000,
    items: []
  },
  'SS_PLUS': {
    name: 'SS+ Rank Examiner',
    targetRank: 'SS_PLUS',
    level: 601,
    ace: 'kommo-o',
    team: ['guzzlord','beldum','garchomp-mega-z','dragonite-mega','zygarde-complete','kommo-o'],
    coins: 15000000,
    xp: 60000000,
    items: []
  },
  'SSS_MINUS': {
    name: 'SSS- Rank Examiner',
    targetRank: 'SSS_MINUS',
    level: 701,
    ace: 'thundurus-incarnate',
    team: ['iron-thorns','raikou','darkrai','melmetal-gmax','tornadus-incarnate','thundurus-incarnate'],
    coins: 40000000,
    xp: 150000000,
    items: []
  },
  'SSS': {
    name: 'SSS Rank Examiner',
    targetRank: 'SSS',
    level: 801,
    ace: 'ogerpon-wellspring-mask',
    team: ['munkidori','zarude','regirock','registeel','thundurus-therian','ogerpon-wellspring-mask'],
    coins: 100000000,
    xp: 300000000,
    items: []
  },
  'SSS_PLUS': {
    name: 'SSS+ Rank Examiner',
    targetRank: 'SSS_PLUS',
    level: 901,
    ace: 'thundurus-incarnate',
    team: ['keldeo-resolute','zapdos-galar','tapu-fini','iron-jugulis','garchomp-mega-z','thundurus-incarnate'],
    coins: 250000000,
    xp: 600000000,
    items: []
  },
  'EX': {
    name: 'EX Rank Examiner',
    targetRank: 'EX',
    level: 1001,
    ace: 'koraidon',
    team: ['groudon-primal','kyogre-primal','lugia','kyogre','yveltal','koraidon'],
    coins: 1500000000,
    xp: 4000000000,
    items: []
  }
};
