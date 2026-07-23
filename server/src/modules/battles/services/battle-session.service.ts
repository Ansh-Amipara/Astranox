import { TrainersRepository } from '../../trainers/trainers.repository';
import { BattlesRepository } from '../repositories/battles.repository';
import { NotFoundError, ValidationError } from '../../../common/errors/AppError';
import { createPokemonInstance } from '../../../game/instance/PokemonInstance';
import { mapOwnedPokemonToInstance } from '../../trainers/owned-pokemon.mapper';
import { ActivePokemon } from '../../../game/battle-state/types';
import crypto from 'crypto';
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

    const realm = await prisma.astralRealm.findUnique({ where: { id: realmId } });
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

  async engageNpc(userId: string, npcTrainerId: string) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');

    const active = await this.repository.getActiveBattleByTrainer(trainerSave.id);
    if (active) throw new ValidationError('You are already in a battle.');

    if (trainerSave.party.length === 0) throw new ValidationError('You have no Pokemon to battle with!');

    const npc = await prisma.npcTrainer.findUnique({
      where: { id: npcTrainerId },
      include: { party: { orderBy: { position: 'asc' } } }
    });

    if (!npc || npc.party.length === 0) throw new NotFoundError('NPC Trainer not found or has no Pokemon.');

    const opponentPartyData = [];
    for (const p of npc.party) {
       const species = await prisma.species.findUnique({ where: { id: p.speciesId }, include: { type1: true, type2: true } });
       if (!species) continue;
       
       const types = [species.type1.name];
       if (species.type2) types.push(species.type2.name);

       const learnset = await prisma.learnset.findMany({
         where: { speciesId: p.speciesId, level: { lte: p.level } },
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
       const moves = latestMoves.map((m: any, i: number) => ({
         moveId: m.moveId,
         currentSlot: i,
         name: m.move.name,
         type: m.move.type.name
       }));

       const npcInstance = createPokemonInstance({
         id: p.id,
         nickname: species.name,
         level: p.level,
         potential: getNpcPotential(p.level),
         ivs: { hp: p.ivHp, attack: p.ivAttack, defense: p.ivDefense, spAtk: p.ivSpAtk, spDef: p.ivSpDef, speed: p.ivSpeed },
         species: {
           id: species.id,
           name: species.name,
           types,
           baseStats: { hp: species.hp, attack: species.attack, defense: species.defense, spAtk: species.spAtk, spDef: species.spDef, speed: species.speed }
         },
         moves
       });
       opponentPartyData.push(toActivePokemon(npcInstance));
    }

    if (opponentPartyData.length === 0) throw new ValidationError('NPC party is invalid.');

    const playerLead = mapOwnedPokemonToInstance(trainerSave.party[0] as any);
    const playerActive = toActivePokemon(playerLead);
    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.repository.createBattleSession({
      trainerId: trainerSave.id,
      playerActivePokemonId: playerActive.id,
      opponentPokemonData: opponentPartyData[0],
      opponentPartyData,
      playerPokemonData: playerActive,
      playerPartyData,
      battleType: 'NPC',
      npcTrainerId
    });

    return {
      npcTrainer: { id: npc.id, name: npc.name, spriteUrl: npc.spriteUrl, trainerClass: npc.trainerClass },
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
}
