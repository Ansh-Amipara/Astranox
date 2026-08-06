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

// Allowed pseudo-legendaries
const ALLOWED_STARTER_IDS = [147, 246, 371, 374, 443, 633, 704, 782, 885];

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
      throw new ValidationError('Invalid starter choice. Must be a Pseudo-Legendary baby form.');
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
    const xpReward = Math.floor(pokemonToSmelt.currentXp * 0.60);

    // Calculate Pearl rewards
    const potentialOrder = [
      'F_MINUS', 'F', 'F_PLUS', 
      'E_MINUS', 'E', 'E_PLUS', 
      'D_MINUS', 'D', 'D_PLUS',
      'C_MINUS', 'C', 'C_PLUS',
      'B_MINUS', 'B', 'B_PLUS',
      'A_MINUS', 'A', 'A_PLUS',
      'S_MINUS', 'S', 'S_PLUS',
      'SS_MINUS', 'SS', 'SS_PLUS',
      'SSS_MINUS', 'SSS', 'SSS_PLUS',
      'EX_MINUS', 'EX', 'EX_PLUS'
    ];
    
    // The specific pearl mapping logic used in the game DB
    const getPearlItemId = (potential: string) => {
      return `${potential.toLowerCase().replace('_', '-')}-pearl`;
    };

    const targetIndex = potentialOrder.indexOf(pokemonToSmelt.potential);
    const pearlsToAward: { type: string, quantity: number, itemId: string }[] = [];

    // Start from BRONZE (index 1) since Black Iron has no pearl
    for (let i = 1; i <= targetIndex; i++) {
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
      // Mega evolution logic
      const targetSpecies = await this.repo.getSpeciesById(targetSpeciesId);
      if (!targetSpecies) throw new NotFoundError('Target species not found');
      
      if (!targetSpecies.isMega || targetSpecies.baseSpeciesId !== species.id) {
        throw new ValidationError('Invalid mega evolution target.');
      }

      // Convert name format 'metagross-mega' -> 'metagrossite', 'charizard-mega-x' -> 'charizardite-x'
      let megaStoneName = targetSpecies.name.replace('-mega', 'ite');
      if (megaStoneName.includes('ite-x')) megaStoneName = megaStoneName.replace('ite-x', 'ite-x');
      if (megaStoneName.includes('ite-y')) megaStoneName = megaStoneName.replace('ite-y', 'ite-y');

      const item = await this.repo.getInventoryItem(save.id, megaStoneName);
      if (!item || item.quantity <= 0) {
        throw new ValidationError(`You do not have the required ${megaStoneName.replace('-', ' ')} to mega evolve this Pokemon.`);
      }

      finalEvolvesToId = targetSpecies.id;
      itemIdToConsume = megaStoneName;
    } else {
      // Normal evolution logic
      if (!species.evolvesToId) {
        throw new ValidationError('This Pokemon cannot evolve.');
      }

      if (species.evolutionLevel && pokemon.level >= species.evolutionLevel) {
        // Level requirement met
      } else if (species.evolutionItem) {
        // Stone requirement
        const item = await this.repo.getInventoryItem(save.id, species.evolutionItem);
        if (!item || item.quantity <= 0) {
          throw new ValidationError(`You do not have the required ${species.evolutionItem} to evolve this Pokemon.`);
        }
        itemIdToConsume = species.evolutionItem;
      } else {
        throw new ValidationError('This Pokemon has not met its evolution requirements yet.');
      }
      
      finalEvolvesToId = species.evolvesToId;
    }

    const evolvedPokemon = await this.repo.evolvePokemon(save.id, pokemonId, finalEvolvesToId, itemIdToConsume);
    // Since evolvePokemon doesn't return the fully included entity, we should fetch it or map what we have.
    // However, the previous implementation just returned evolvedPokemon which is the OwnedPokemon object.
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
      'F_MINUS', 'F', 'F_PLUS', 
      'E_MINUS', 'E', 'E_PLUS', 
      'D_MINUS', 'D', 'D_PLUS',
      'C_MINUS', 'C', 'C_PLUS',
      'B_MINUS', 'B', 'B_PLUS',
      'A_MINUS', 'A', 'A_PLUS',
      'S_MINUS', 'S', 'S_PLUS',
      'SS_MINUS', 'SS', 'SS_PLUS',
      'SSS_MINUS', 'SSS', 'SSS_PLUS',
      'EX_MINUS', 'EX', 'EX_PLUS'
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

