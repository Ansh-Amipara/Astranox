import { TrainersRepository } from './trainers.repository';
import { ValidationError, NotFoundError } from '../../common/errors/AppError';
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

export class TrainersService {
  private repo: TrainersRepository;

  constructor() {
    this.repo = new TrainersRepository();
  }

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

  async getBox(userId: string, boxNumber: number): Promise<OwnedPokemonDto[]> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    const box = await this.repo.getBox(save.id, boxNumber);
    return box.map(TrainerMapper.toOwnedPokemonDto);
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

    const result = await this.repo.changeMoves(save.id, pokemonId, dto.moves as number[]);
    if (!result) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }
    
    return result;
  }

  async releasePokemon(userId: string, pokemonId: string): Promise<boolean> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    
    // Prevent releasing if it's the last pokemon in the party
    const partyCount = save.party.length;
    
    const pokemonToRelease = await this.repo.findByUserId(userId).then((s: any) => {
      // Find in party
      const inParty = s.party.find((p: any) => p.id === pokemonId);
      if (inParty) return inParty;
      // Have to check if it exists in DB at all to see if it's in the PC
      // We can just rely on the delete failing if it doesn't exist, but we need to prevent last party member deletion
      return inParty;
    });

    if (pokemonToRelease && pokemonToRelease.isParty && partyCount <= 1) {
      throw new ValidationError('You cannot release your last active party Pokemon.');
    }

    const result = await this.repo.releasePokemon(save.id, pokemonId);
    if (result.count === 0) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }
    
    return true;
  }

  async evolvePokemon(userId: string, pokemonId: string): Promise<OwnedPokemonDto> {
    const save = await this.repo.findByUserId(userId);
    if (!save) throw new NotFoundError('Save not found');
    
    const pokemon = await this.repo.getPokemonById(save.id, pokemonId);
    if (!pokemon) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }

    const species = pokemon.species;
    if (!species.evolvesToId) {
      throw new ValidationError('This Pokemon cannot evolve.');
    }

    let itemIdToConsume: string | undefined;

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

    const evolvedPokemon = await this.repo.evolvePokemon(save.id, pokemonId, species.evolvesToId, itemIdToConsume);
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

    const { itemId } = dto;
    const item = await this.repo.getInventoryItem(save.id, itemId);
    if (!item || item.quantity <= 0) {
      throw new ValidationError(`You do not have a ${itemId} to boost potential.`);
    }

    const validProgressions: Record<string, { current: PokemonPotential, next: PokemonPotential }> = {
      'bronze-pearl': { current: PokemonPotential.BLACK_IRON, next: PokemonPotential.BRONZE },
      'silver-pearl': { current: PokemonPotential.BRONZE, next: PokemonPotential.SILVER },
      'gold-pearl': { current: PokemonPotential.SILVER, next: PokemonPotential.GOLD },
      'platinum-pearl': { current: PokemonPotential.GOLD, next: PokemonPotential.PLATINUM },
      'adamantite-pearl': { current: PokemonPotential.PLATINUM, next: PokemonPotential.ADAMANTITE },
      'diamond-pearl': { current: PokemonPotential.ADAMANTITE, next: PokemonPotential.DIAMOND },
      'crystal-pearl': { current: PokemonPotential.DIAMOND, next: PokemonPotential.CRYSTAL },
      'epic-pearl': { current: PokemonPotential.CRYSTAL, next: PokemonPotential.EPIC },
      // Legacy crystals
      'bronze-crystal': { current: PokemonPotential.BLACK_IRON, next: PokemonPotential.BRONZE },
      'silver-crystal': { current: PokemonPotential.BRONZE, next: PokemonPotential.SILVER },
      'gold-crystal': { current: PokemonPotential.SILVER, next: PokemonPotential.GOLD },
      'platinum-crystal': { current: PokemonPotential.GOLD, next: PokemonPotential.PLATINUM },
      'adamantite-crystal': { current: PokemonPotential.PLATINUM, next: PokemonPotential.ADAMANTITE },
      'diamond-crystal': { current: PokemonPotential.ADAMANTITE, next: PokemonPotential.DIAMOND },
      'crystal-crystal': { current: PokemonPotential.DIAMOND, next: PokemonPotential.CRYSTAL },
      'epic-crystal': { current: PokemonPotential.CRYSTAL, next: PokemonPotential.EPIC },
      'heroic-crystal': { current: PokemonPotential.EPIC, next: PokemonPotential.HEROIC },
      'sovereign-crystal': { current: PokemonPotential.HEROIC, next: PokemonPotential.SOVEREIGN },
      'legendary-crystal': { current: PokemonPotential.SOVEREIGN, next: PokemonPotential.LEGENDARY },
      'divine-crystal': { current: PokemonPotential.LEGENDARY, next: PokemonPotential.DIVINE },
      'celestial-crystal': { current: PokemonPotential.DIVINE, next: PokemonPotential.CELESTIAL },
      'primordial-crystal': { current: PokemonPotential.CELESTIAL, next: PokemonPotential.PRIMORDIAL },
      'mythical-crystal': { current: PokemonPotential.PRIMORDIAL, next: PokemonPotential.MYTHICAL },
      'infinity-crystal': { current: PokemonPotential.MYTHICAL, next: PokemonPotential.INFINITY },
      'eternal-crystal': { current: PokemonPotential.INFINITY, next: PokemonPotential.ETERNAL },
    };

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
}

