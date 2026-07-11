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

  async addMoney(adminId: string, userId: string, amount: number) {
    if (amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    const result = await this.repo.addMoney(userId, amount);
    if (!result) {
      throw new NotFoundError('Trainer save not found for this user');
    }
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADD_MONEY',
        entityType: 'USER',
        entityId: userId,
        afterValues: { amount }
      }
    });
    return result;
  }

  async getAllSpecies() {
    return this.repo.getAllSpecies();
  }

  async getUserPokemon(userId: string) {
    return this.repo.getUserPokemon(userId);
  }



  async addPokemon(adminId: string, userId: string, speciesId: number, level: number, ivs?: any) {
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
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADD_POKEMON',
        entityType: 'USER',
        entityId: userId,
        afterValues: { speciesId, level, ivs }
      }
    });
    return result;
  }

  async getAllMaps() {
    return this.repo.getAllMaps();
  }

  async addSpawnToMap(adminId: string, gameMapId: string, speciesId: number, minLevel: number, maxLevel: number, spawnRate: number) {
    if (minLevel > maxLevel) throw new ValidationError('minLevel cannot be greater than maxLevel');
    if (minLevel < 1 || maxLevel > 100) throw new ValidationError('Levels must be between 1 and 100');
    if (spawnRate <= 0 || spawnRate > 100) throw new ValidationError('spawnRate must be between 1 and 100');

    const species = await prisma.species.findUnique({ where: { id: speciesId } });
    if (!species) throw new ValidationError('Invalid species ID');

    const result = await this.repo.addSpawnToMap(gameMapId, speciesId, minLevel, maxLevel, spawnRate);
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADD_SPAWN',
        entityType: 'GAME_MAP',
        entityId: gameMapId,
        afterValues: { speciesId, minLevel, maxLevel, spawnRate }
      }
    });
    return result;
  }

  async removeSpawn(adminId: string, spawnEntryId: string) {
    const result = await this.repo.removeSpawn(spawnEntryId);
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'REMOVE_SPAWN',
        entityType: 'SPAWN_ENTRY',
        entityId: spawnEntryId,
      }
    });
    return result;
  }
}
