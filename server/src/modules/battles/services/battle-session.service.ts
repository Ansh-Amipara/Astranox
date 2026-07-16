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

function getNpcPotential(level: number): string {
  if (level <= 20) return 'BRONZE';
  if (level <= 40) return 'SILVER';
  if (level <= 60) return 'GOLD';
  if (level <= 80) return 'PLATINUM';
  if (level <= 90) return 'DIAMOND';
  if (level <= 100) return 'EPIC';
  return 'LEGENDARY';
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
      potential: 'BLACK_IRON',
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
    const lead = trainerSave.party[0]; // Already ordered by position
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);

    // 4. Create BattleSession
    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.repository.createBattleSession({
      trainerId,
      playerActivePokemonId: playerActive.id,
      opponentPokemonData: wildActive,
      playerPokemonData: playerActive,
      playerPartyData
    });

    return {
      encounter: {
        species: species,
        level: level
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
