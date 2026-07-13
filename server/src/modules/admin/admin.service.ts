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

  async addPokemon(adminId: string, userId: string, speciesId: number, level: number, ivs?: { ivHp?: number, ivAttack?: number, ivDefense?: number, ivSpAtk?: number, ivSpDef?: number, ivSpeed?: number }) {
    if (level < 1 || level > 100) {
      throw new ValidationError('Level must be between 1 and 100');
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
}
