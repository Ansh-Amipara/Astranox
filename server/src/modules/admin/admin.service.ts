import { AdminRepository } from './admin.repository';
import { ValidationError, NotFoundError } from '../../common/errors/AppError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminService {
  private repo: AdminRepository;

  constructor() {
    this.repo = new AdminRepository();
  }

  async getAllUsers() {
    return this.repo.getAllUsers();
  }

  async addMoney(userId: string, amount: number) {
    if (amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    const result = await this.repo.addMoney(userId, amount);
    if (!result) {
      throw new NotFoundError('Trainer save not found for this user');
    }
    return result;
  }

  async getAllSpecies() {
    return this.repo.getAllSpecies();
  }

  async getUserPokemon(userId: string) {
    return this.repo.getUserPokemon(userId);
  }

  async getAllZones() {
    return this.repo.getAllZones();
  }

  async addZoneEncounter(zoneId: number, speciesId: number, encounterRate: number, minIv: number, maxIv: number) {
    if (encounterRate <= 0 || encounterRate > 100) {
      throw new ValidationError('Encounter rate must be between 0 and 100');
    }
    if (minIv < 0 || maxIv > 31 || minIv > maxIv) {
      throw new ValidationError('Invalid IV range. Must be between 0 and 31, and min <= max.');
    }
    return this.repo.addZoneEncounter(zoneId, speciesId, encounterRate, minIv, maxIv);
  }

  async deleteZoneEncounter(encounterId: number) {
    return this.repo.deleteZoneEncounter(encounterId);
  }

  async addPokemon(userId: string, speciesId: number, level: number, ivs?: any) {
    if (level < 1 || level > 100) {
      throw new ValidationError('Level must be between 1 and 100');
    }
    if (ivs) {
      ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'].forEach(stat => {
        if (ivs[stat] !== undefined && (ivs[stat] < 0 || ivs[stat] > 31)) {
          throw new ValidationError(`IV ${stat} must be between 0 and 31`);
        }
      });
    }
    
    // Verify species exists
    const species = await prisma.species.findUnique({ where: { id: speciesId } });
    if (!species) {
      throw new ValidationError('Invalid species ID');
    }

    const result = await this.repo.addPokemon(userId, speciesId, level, ivs);
    if (!result) {
      throw new NotFoundError('Trainer save not found for this user');
    }
    return result;
  }
}
