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
      save = await this.repo.createTrainerSave(userId);
    }
    
    return save;
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
}
