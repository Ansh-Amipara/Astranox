import { TrainersRepository } from './trainers.repository';
import { ValidationError, NotFoundError } from '../../common/errors/AppError';

// Allowed pseudo-legendaries
const ALLOWED_STARTER_IDS = [147, 246, 371, 374, 443, 633, 704, 782, 885];

export class TrainersService {
  private repo: TrainersRepository;

  constructor() {
    this.repo = new TrainersRepository();
  }

  async getMySave(userId: string) {
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
    
    return save!;
  }

  async pickStarter(userId: string, speciesId: number) {
    const save = await this.getMySave(userId);
    
    if (save.starterChosenAt) {
      throw new ValidationError('You have already chosen a starter Pokémon.');
    }

    if (!ALLOWED_STARTER_IDS.includes(speciesId)) {
      throw new ValidationError('Invalid starter choice. Must be a Pseudo-Legendary baby form.');
    }

    return await this.repo.setStarter(save.id, speciesId);
  }

  async getBox(userId: string, boxNumber: number) {
    const save = await this.getMySave(userId);
    return this.repo.getBox(save.id, boxNumber);
  }

  async swapSlots(
    userId: string, 
    from: { isParty: boolean; boxNumber: number | null; position: number },
    to: { isParty: boolean; boxNumber: number | null; position: number }
  ) {
    const save = await this.getMySave(userId);
    return this.repo.swapSlots(save.id, from, to);
  }

  async getAllMoves() {
    return this.repo.getAllMoves();
  }

  async changeMoves(userId: string, pokemonId: string, moveIds: number[]) {
    const save = await this.getMySave(userId);
    
    if (!Array.isArray(moveIds) || moveIds.length > 4) {
      throw new ValidationError('Moves must be an array of at most 4 move IDs.');
    }

    const result = await this.repo.changeMoves(save.id, pokemonId, moveIds);
    if (!result) {
      throw new NotFoundError('Pokemon not found or does not belong to you.');
    }
    
    return result;
  }

  async releasePokemon(userId: string, pokemonId: string) {
    const save = await this.getMySave(userId);
    
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

  async evolvePokemon(userId: string, pokemonId: string) {
    const save = await this.getMySave(userId);
    
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
    return evolvedPokemon;
  }
}
