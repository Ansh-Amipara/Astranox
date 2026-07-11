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
}
