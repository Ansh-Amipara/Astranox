import { injectable } from 'tsyringe';
import { TrainersRepository } from './trainers.repository';
import { ValidationError, NotFoundError } from '../../core/errors/AppError';
import { TrainerMapper } from './dto/mapper';
import type { TrainerSaveDto } from './dto/response/TrainerSaveDto';
import type { OwnedPokemonDto } from './dto/response/OwnedPokemonDto';
import type { MoveDto } from './dto/response/MoveDto';
import type { PickStarterDto } from './dto/request/PickStarterDto';
import type { SwapSlotsDto } from './dto/request/SwapSlotsDto';
import type { ChangeMovesDto } from './dto/request/ChangeMovesDto';
import type { BoostPotentialDto } from './dto/request/BoostPotentialDto';
import type { BoostIvDto } from './dto/request/BoostIvDto';
import { PokemonPotential } from '@prisma/client';
import { ECONOMY_CONSTANTS, RANK_ORDER } from '@astranox/constants';

// Allowed pseudo-legendaries
const ALLOWED_STARTER_IDS = [
  1, 4, 7, 152, 155, 158, 252, 255, 258,
  387, 390, 393, 495, 498, 501, 650, 653, 656,
  722, 725, 728, 810, 813, 816, 906, 909, 912
];

@injectable()
export class TrainersService {
  constructor(private repo: TrainersRepository) {}

  async getMySave(userId: string): Promise<TrainerSaveDto> {
    let save = await this.repo.findByUserId(userId);
    
    // Automatically initialize save file for new users
    if (!save) {
      try {
        save = await this.repo.createTrainerSave(userId);
      } catch (err: any) {
        // If two simultaneous requests try to create a save, catch the unique constraint error
        if (err.code === 'P2002') {
          save = await this.repo.findByUserId(userId);
        } else {
          throw err;
        }
      }
    }
    
    return TrainerMapper.toTrainerSaveDto(save!);
  }

  async pickStarter(userId: string, dto: PickStarterDto): Promise<TrainerSaveDto> {
    const save = await this.repo.findByUserId(userId);
    
    if (save?.starterChosenAt) {
      throw new ValidationError('You have already chosen a starter Pokémon.');
    }

    if (!ALLOWED_STARTER_IDS.includes(dto.speciesId)) {
      throw new ValidationError('Invalid starter choice. Must be a classic starter Pokémon.');
    }

    const updatedSave = await this.repo.setStarter(save!.id, dto.speciesId);
    return TrainerMapper.toTrainerSaveDto(updatedSave);
  }



  async getAllPokemon(userId: string, page: number, limit: number): Promise<{ data: OwnedPokemonDto[], total: number }> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    const result = await this.repo.getAllPokemon(save.id, page, limit);
    return {
      data: result.data.map(TrainerMapper.toOwnedPokemonDto),
      total: result.total
    };
  }

  async getPokemonById(userId: string, pokemonId: string): Promise<OwnedPokemonDto> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    const pokemon = await this.repo.getPokemonById(save.id, pokemonId);
    if (!pokemon) throw new NotFoundError('Pokemon not found');
    return TrainerMapper.toOwnedPokemonDto(pokemon);
  }

  async removeFromParty(userId: string, pokemonId: string): Promise<void> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    await this.repo.removeFromParty(save.id, pokemonId);
  }

  async addToParty(userId: string, pokemonId: string, position: number): Promise<void> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    await this.repo.addToParty(save.id, pokemonId, position);
  }

  async swapSlots(userId: string, dto: SwapSlotsDto): Promise<boolean> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    return this.repo.swapSlots(save.id, dto.from, dto.to);
  }

  async getAllMoves(): Promise<MoveDto[]> {
    const moves = await this.repo.getAllMoves();
    return TrainerMapper.toMoveDtoList(moves);
  }

  async changeMoves(userId: string, pokemonId: string, dto: ChangeMovesDto): Promise<boolean> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    
    if (!Array.isArray(dto.moves) || dto.moves.length > 4) {
      throw new ValidationError('Moves must be an array of at most 4 move IDs.');
    }

    const pokemon = await this.repo.getPokemonById(save.id, pokemonId);
    if (!pokemon) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }

    const availableMoves = await this.repo.getAvailableMovesForPokemon(save.id, pokemon.speciesId, pokemon.level);
    const availableMoveSet = new Set(availableMoves);

    for (const moveId of dto.moves as number[]) {
      if (!availableMoveSet.has(moveId)) {
        throw new ValidationError(`Move ${moveId} is not unlocked for this Pokémon. It must be learned naturally or purchased from the Astral Move Shop.`);
      }
    }

    const result = await this.repo.changeMoves(save.id, pokemonId, dto.moves as number[]);
    if (!result) {
      throw new NotFoundError('Failed to change moves.');
    }
    
    return result;
  }

  async smeltPokemon(userId: string, pokemonId: string): Promise<{ storedXp: number, pearls: { type: string, quantity: number }[] }> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    
    const pokemonToSmelt = await this.repo.getPokemonById(save.id, pokemonId);
    if (!pokemonToSmelt) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }

    // Prevent smelting if the pokemon is in the party or escrowed
    if (pokemonToSmelt.isEscrowed) {
      throw new ValidationError('Cannot smelt a Pokémon that is currently locked in a marketplace trade or offer.');
    }
    if (pokemonToSmelt.isParty) {
      throw new ValidationError('Cannot smelt a Pokémon that is currently in your party. Please remove it from your party first.');
    }

    // Calculate XP reward
    const xpReward = Math.floor(pokemonToSmelt.currentXp * ECONOMY_CONSTANTS.SMELT_XP_RATIO);

    // Calculate Pearl rewards
    const potentialOrder = RANK_ORDER;
    
    // The specific pearl mapping logic used in the game DB
    const getPearlItemId = (potential: string) => {
      return `${potential.toLowerCase().replace('_', '-')}-pearl`;
    };

    const targetIndex = potentialOrder.indexOf(pokemonToSmelt.potential);
    const pearlsToAward: { type: string, quantity: number, itemId: string }[] = [];

    // F rank is index 0. Lower tiers are awarded 100% for i < targetIndex.
    for (let i = 0; i <= targetIndex; i++) {
      const pot = potentialOrder[i];
      if (i < targetIndex) {
        // Lower tiers are 100%
        pearlsToAward.push({ type: pot.charAt(0) + pot.slice(1).toLowerCase(), quantity: 1, itemId: getPearlItemId(pot) });
      } else if (i === targetIndex) {
        // Same tier
        const chance = pokemonToSmelt.isBound ? 0.20 : 0.50;
        if (Math.random() < chance) {
          pearlsToAward.push({ type: pot.charAt(0) + pot.slice(1).toLowerCase(), quantity: 1, itemId: getPearlItemId(pot) });
        }
      }
    }

    const pearlRewardsForDb = pearlsToAward.map(p => ({ itemId: p.itemId, quantity: p.quantity }));
    const pearlsForResponse = pearlsToAward.map(p => ({ type: p.type, quantity: p.quantity }));

    const result = await this.repo.smeltPokemon(save.id, pokemonId, xpReward, pearlRewardsForDb);
    if (result.count === 0) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }
    
    return { storedXp: xpReward, pearls: pearlsForResponse };
  }

  async evolvePokemon(userId: string, pokemonId: string, targetSpeciesId?: number): Promise<OwnedPokemonDto> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    
    const pokemon = await this.repo.getPokemonById(save.id, pokemonId);
    if (!pokemon) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }

    if (pokemon.isEscrowed) {
      throw new ValidationError('Cannot evolve a Pokémon that is currently locked in a marketplace trade or offer.');
    }

    const species = pokemon.species;
    let finalEvolvesToId: number;
    let itemIdToConsume: string | undefined;

    if (targetSpeciesId) {
      const targetSpecies = await this.repo.getSpeciesById(targetSpeciesId);
      if (!targetSpecies) throw new NotFoundError('Target species not found');
      
      const isValidMega = species.megaEvolvesToIds.includes(targetSpecies.id);
      const isValidGmax = species.gmaxEvolvesToIds.includes(targetSpecies.id);
      const isBaseSpecies = targetSpecies.baseSpeciesId === species.id;
      const isStandardEvolution = species.evolvesTo?.some((e: any) => e.id === targetSpecies.id);

      if (isValidMega || isValidGmax || isBaseSpecies) {
        if (!save.unlockedForms || !save.unlockedForms.includes(targetSpecies.id)) {
          throw new ValidationError(`You must defeat ${targetSpecies.name.toUpperCase()} in battle before you can evolve into it.`);
        }
        finalEvolvesToId = targetSpecies.id;
      } else if (isStandardEvolution) {
        if (species.evolveByBattle) {
          if (!save.unlockedForms || !save.unlockedForms.includes(targetSpecies.id)) {
            throw new ValidationError(`You must defeat ${targetSpecies.name.toUpperCase()} in battle before you can evolve into it.`);
          }
        } else if (!species.evolutionLevel || pokemon.level < species.evolutionLevel) {
          throw new ValidationError('This Pokemon has not met its evolution requirements yet.');
        }
        finalEvolvesToId = targetSpecies.id;
      } else {
        throw new ValidationError('Invalid evolution target.');
      }
    } else {
      if (!species.evolvesTo || species.evolvesTo.length === 0) {
        throw new ValidationError('This Pokemon cannot evolve.');
      }
      if (species.evolvesTo.length > 1) {
        throw new ValidationError('Please specify which evolution path to take.');
      }
      
      const targetSpecies = species.evolvesTo[0];
      if (species.evolveByBattle) {
        if (!save.unlockedForms || !save.unlockedForms.includes(targetSpecies.id)) {
          throw new ValidationError(`You must defeat ${targetSpecies.name.toUpperCase()} in battle before you can evolve into it.`);
        }
      } else if (!species.evolutionLevel || pokemon.level < species.evolutionLevel) {
        throw new ValidationError('This Pokemon has not met its evolution requirements yet.');
      }
      
      finalEvolvesToId = targetSpecies.id;
    }

    const evolvedPokemon = await this.repo.evolvePokemon(save.id, pokemonId, finalEvolvesToId, itemIdToConsume);
    // Since evolvePokemon doesn't return the fully included entity, we should fetch it or map what we have.
    // However, the previous implementation just returned evolvedPokemon which is the OwnedPokemon object.
    const fullyIncludedPokemon = await this.repo.getPokemonById(save.id, pokemonId);
    return TrainerMapper.toOwnedPokemonDto(fullyIncludedPokemon);
  }

  async devolvePokemon(userId: string, pokemonId: string): Promise<OwnedPokemonDto> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    
    const pokemon = await this.repo.getPokemonById(save.id, pokemonId);
    if (!pokemon) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }

    if (pokemon.isEscrowed) {
      throw new ValidationError('Cannot devolve a Pokémon that is currently locked in a marketplace trade or offer.');
    }

    const species = pokemon.species;
    
    if ((!species.isMega && !species.isGmax) || !species.baseSpeciesId) {
      throw new ValidationError('This Pokemon is not in a Mega or G-Max form.');
    }

    await this.repo.evolvePokemon(save.id, pokemonId, species.baseSpeciesId);
    
    const fullyIncludedPokemon = await this.repo.getPokemonById(save.id, pokemonId);
    return TrainerMapper.toOwnedPokemonDto(fullyIncludedPokemon);
  }

  async boostPotential(userId: string, pokemonId: string, dto: BoostPotentialDto): Promise<OwnedPokemonDto> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    
    const pokemon = await this.repo.getPokemonById(save.id, pokemonId);
    if (!pokemon) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }

    if (pokemon.isEscrowed) {
      throw new ValidationError('Cannot modify a Pokémon that is currently locked in a marketplace trade or offer.');
    }

    const { itemId } = dto;
    const item = await this.repo.getInventoryItem(save.id, itemId);
    if (!item || item.quantity <= 0) {
      throw new ValidationError(`You do not have a ${itemId} to boost potential.`);
    }

    const potentialOrder = [
      'F', 'E', 'D', 'C', 'B', 'A',
      'S_MINUS', 'S', 'S_PLUS',
      'SS_MINUS', 'SS', 'SS_PLUS',
      'SSS_MINUS', 'SSS', 'SSS_PLUS',
      'EX'
    ];

    const validProgressions: Record<string, { current: PokemonPotential, next: PokemonPotential }> = {};
    for (let i = 0; i < potentialOrder.length - 1; i++) {
      const current = potentialOrder[i] as PokemonPotential;
      const next = potentialOrder[i + 1] as PokemonPotential;
      validProgressions[`${next.toLowerCase().replace('_', '-')}-pearl`] = { current, next };
    }

    const progression = validProgressions[itemId];
    if (!progression) {
      throw new ValidationError('Invalid crystal type provided.');
    }

    if (pokemon.potential !== progression.current) {
      throw new ValidationError(`This crystal can only be used on ${progression.current} potential Pokémon.`);
    }

    const updatedPokemon = await this.repo.boostPotential(save.id, pokemonId, progression.next, itemId);
    return TrainerMapper.toOwnedPokemonDto(updatedPokemon);
  }

  async boostIv(userId: string, pokemonId: string, dto: BoostIvDto): Promise<OwnedPokemonDto> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    
    const pokemon = await this.repo.getPokemonById(save.id, pokemonId);
    if (!pokemon) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }

    const { itemId, stat } = dto;
    const item = await this.repo.getInventoryItem(save.id, itemId);
    if (!item || item.quantity <= 0) {
      throw new ValidationError(`You do not have a ${itemId} to boost IVs.`);
    }

    // Determine current stat value
    const currentValue = pokemon[stat] as number;

    // Handle bottle caps
    if (itemId === 'gold-bottle-cap') {
      const updatedPokemon = await this.repo.boostAllIvs(save.id, pokemonId, itemId);
      return TrainerMapper.toOwnedPokemonDto(updatedPokemon);
    }

    if (itemId === 'bottle-cap') {
      if (currentValue >= 31) {
        throw new ValidationError('This stat is already maxed out (31).');
      }
      const updatedPokemon = await this.repo.boostIv(save.id, pokemonId, stat, 31, itemId);
      return TrainerMapper.toOwnedPokemonDto(updatedPokemon);
    }

    throw new ValidationError('Invalid item type provided for IV boost.');
  }

  async distributeXp(userId: string, pokemonId: string, amount: number): Promise<{ trainer: TrainerSaveDto; pokemon: OwnedPokemonDto }> {
    if (!amount || amount <= 0) {
      throw new ValidationError('XP amount must be greater than 0.');
    }

    const trainer = await this.repo.findByUserId(userId);
    if (!trainer) throw new NotFoundError('Trainer save not found.');

    if (trainer.storedXp < amount) {
      throw new ValidationError(`Insufficient Stored XP. You have ${trainer.storedXp} XP available.`);
    }

    const pokemon = await this.repo.findPokemonById(pokemonId);
    if (!pokemon || pokemon.trainerId !== trainer.id) {
      throw new NotFoundError('Pokémon not found in your collection.');
    }

    const { getLevelFromXp, getXpForLevel } = require('../../game/battle/level-math');
    const { getMaxLevelForPotential } = require('../../game/instance/PokemonInstance');

    const maxLevel = getMaxLevelForPotential(pokemon.potential);
    const maxXpForPotential = getXpForLevel(maxLevel + 1) - 1;

    let actualAdd = amount;
    if (pokemon.currentXp + amount > maxXpForPotential) {
      actualAdd = Math.max(0, maxXpForPotential - pokemon.currentXp);
    }

    if (actualAdd <= 0) {
      throw new ValidationError(`This Pokémon is already capped at maximum level for its potential (${pokemon.potential}).`);
    }

    const newXp = pokemon.currentXp + actualAdd;
    const newLevel = getLevelFromXp(newXp);

    const { trainer: updatedTrainer, pokemon: updatedPokemon } = await this.repo.distributeXp(
      trainer.id,
      pokemon.id,
      actualAdd,
      newXp,
      newLevel
    );

    return {
      trainer: TrainerMapper.toTrainerSaveDto(updatedTrainer as any),
      pokemon: TrainerMapper.toOwnedPokemonDto(updatedPokemon as any)
    };
  }
}

