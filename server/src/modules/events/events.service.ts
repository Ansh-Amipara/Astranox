import { injectable } from 'tsyringe';
import { EventsRepository } from './events.repository';
import { EventTaskType, PrismaClient } from '@prisma/client';
import { AppError, NotFoundError, ValidationError } from '../../core/errors/AppError';
import { createPokemonInstance } from '../../game/instance/PokemonInstance';
import { PokemonInstancePayload } from '../../game/instance/types';
import { prisma } from '../../core/db/prisma';


@injectable()
export class EventsService {
  constructor(private repo: EventsRepository) {}
  private prisma = new PrismaClient(); // For cross-module ops like checking save or adding pokemon

  async emitEvent(trainerId: string, taskType: EventTaskType, data?: any) {
    const activeEvent = await this.repo.getActiveEvent();
    if (!activeEvent) return; // No active event

    // Check expiration
    if (new Date() > activeEvent.endDate) {
      await this.repo.deactivateAllEvents();
      return;
    }

    if (activeEvent.taskType !== taskType) return;

    // Validate config if applicable
    const config: any = activeEvent.taskConfig || {};
    if (config.pokemonType && data?.types) {
      const typeMatches = (data.types as string[]).some(t => t.toLowerCase() === config.pokemonType.toLowerCase());
      if (!typeMatches) return;
    }

    // It matched! Increment progress
    await this.repo.createOrIncrementProgress(trainerId, activeEvent.id);
  }

  async claimReward(userId: string, eventId: string) {
    const save = await this.prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) throw new NotFoundError('Trainer not found.');

    const event = await this.repo.getEventById(eventId);
    if (!event) throw new NotFoundError('Event not found.');

    if (!event.isActive || new Date() > event.endDate) {
      throw new ValidationError('This event has ended and can no longer be claimed.');
    }

    const progressRecord = await this.repo.getEventProgress(save.id, event.id);
    const requiredCount = (event.taskConfig as any)?.requiredCount || 1;
    
    if (!progressRecord || progressRecord.progress < requiredCount) {
      throw new ValidationError('You have not completed the task for this event yet.');
    }

    if (progressRecord.isClaimed) {
      throw new ValidationError('You have already claimed the reward for this event.');
    }

    // Process reward
    const rewardConfig: any = event.rewardConfig;
    if (!rewardConfig || !rewardConfig.speciesId) {
      throw new AppError('Event is misconfigured and missing reward data.', 500);
    }

    const species = await this.prisma.species.findUnique({
      where: { id: rewardConfig.speciesId },
      include: { type1: true, type2: true }
    });
    
    if (!species) throw new AppError('Reward species not found.', 500);

    const level = rewardConfig.level || 5;
    const potential = rewardConfig.potential || 'DIAMOND';
    const form = rewardConfig.form || 'Normal';

    // Fetch learnsets
    const learnsets = await this.prisma.learnset.findMany({
      where: { speciesId: species.id, level: { lte: level } },
      orderBy: { level: 'desc' },
      take: 4,
      include: { move: { include: { type: true } } }
    });

    const moves = learnsets.map(l => ({
      currentSlot: l.learnOrder,
      moveId: l.move.id,
      name: l.move.name,
      type: l.move.type.name
    }));

    const speciesContext = {
      id: species.id,
      name: species.name,
      types: [species.type1.name, species.type2?.name].filter(Boolean) as string[],
      baseStats: { hp: species.hp, attack: species.attack, defense: species.defense, spAtk: species.spAtk, spDef: species.spDef, speed: species.speed },
      isGmax: form === 'Gigantamax' || species.isGmax,
      isMega: form === 'Mega' || species.isMega
    };

    const payload: PokemonInstancePayload = {
      id: `reward-${Date.now()}`,
      level,
      potential,
      ivs: rewardConfig.ivs === 'max' 
        ? { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 }
        : { 
            hp: Math.floor(Math.random() * 32),
            attack: Math.floor(Math.random() * 32),
            defense: Math.floor(Math.random() * 32),
            spAtk: Math.floor(Math.random() * 32),
            spDef: Math.floor(Math.random() * 32),
            speed: Math.floor(Math.random() * 32)
          },
      species: speciesContext,
      moves
    } as any;

    const instance = createPokemonInstance(payload);

    // Give Pokemon and mark claimed
    await this.prisma.$transaction(async (tx) => {
      // Find empty box slot
      let boxNumber = 0;
      let position = 0;
      let slotFound = false;

      const pcPokemon = await tx.ownedPokemon.findMany({
        where: { trainerId: save.id, isParty: false },
        select: { boxNumber: true, position: true }
      });

      const occupied = new Set(pcPokemon.map(p => `${p.boxNumber}-${p.position}`));

      for (let b = 0; b < 32; b++) {
        for (let p = 0; p < 30; p++) {
          if (!occupied.has(`${b}-${p}`)) {
            boxNumber = b;
            position = p;
            slotFound = true;
            break;
          }
        }
        if (slotFound) break;
      }

      if (!slotFound) throw new ValidationError('Your PC is completely full. Make room to claim this reward.');

      await tx.ownedPokemon.create({
        data: {
          trainerId: save.id,
          speciesId: species.id,
          level: instance.level,
          potential: instance.potential as any,
          isParty: false,
          boxNumber,
          position,
          isBound: true, // Permanent bound flag
          ivHp: instance.ivs.hp,
          ivAttack: instance.ivs.attack,
          ivDefense: instance.ivs.defense,
          ivSpAtk: instance.ivs.spAtk,
          ivSpDef: instance.ivs.spDef,
          ivSpeed: instance.ivs.speed,
          moves: {
            create: instance.moves.map(m => ({ moveId: m.moveId, slot: m.currentSlot }))
          }
        }
      });

      await tx.playerEventProgress.update({
        where: { id: progressRecord.id },
        data: { isClaimed: true }
      });
    });

    return { success: true };
  }

  async getActiveEventForPlayer(userId: string) {
    const save = await this.prisma.trainerSave.findUnique({ where: { userId } });
    if (!save) throw new NotFoundError('Trainer not found.');

    const activeEvent = await this.repo.getActiveEvent();
    if (!activeEvent) return null;
    
    // Auto sync
    if (new Date() > activeEvent.endDate) {
      await this.repo.deactivateAllEvents();
      return null;
    }

    const progress = await this.repo.getEventProgress(save.id, activeEvent.id);

    return {
      event: activeEvent,
      progress: progress ? progress.progress : 0,
      isClaimed: progress ? progress.isClaimed : false
    };
  }
}
