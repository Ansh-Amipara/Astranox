import { TrainersRepository } from './trainers.repository';
import { ValidationError, NotFoundError } from '../../common/errors/AppError';
import { TrainerMapper } from './dto/mapper';
import type { TrainerSaveDto } from './dto/response/TrainerSaveDto';
import type { OwnedPokemonDto } from './dto/response/OwnedPokemonDto';
import type { MoveDto } from './dto/response/MoveDto';
import type { PickStarterDto } from './dto/request/PickStarterDto';
import type { SwapSlotsDto } from './dto/request/SwapSlotsDto';
import type { ChangeMovesDto } from './dto/request/ChangeMovesDto';

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
}
