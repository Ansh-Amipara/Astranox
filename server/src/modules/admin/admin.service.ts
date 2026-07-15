import { AdminRepository } from './admin.repository';
import { ValidationError, NotFoundError } from '../../common/errors/AppError';
import { PrismaClient } from '@prisma/client';
import { AdminMapper } from './dto/mapper';
import type { AdminUserDto } from './dto/response/AdminUserDto';
import type { AddMoneyDto } from './dto/request/AddMoneyDto';
import type { AddPokemonDto } from './dto/request/AddPokemonDto';
import { TrainerMapper } from '../trainers/dto/mapper';
import type { TrainerSaveDto } from '../trainers/dto/response/TrainerSaveDto';
import type { OwnedPokemonDto } from '../trainers/dto/response/OwnedPokemonDto';
import { BattleMapper } from '../battles/dto/mapper';
import type { AvailableSpeciesDto } from '../battles/dto/response/AvailableSpeciesDto';

const prisma = new PrismaClient();

export class AdminService {
  private repo: AdminRepository;

  constructor() {
    this.repo = new AdminRepository();
  }

  async getAllUsers(): Promise<AdminUserDto[]> {
    const users = await this.repo.getAllUsers();
    return AdminMapper.toAdminUserDtoList(users);
  }

  async addMoney(adminId: string, userId: string, dto: AddMoneyDto): Promise<TrainerSaveDto> {
    if (dto.amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    const result = await this.repo.addMoney(userId, dto.amount);
    if (!result) {
      throw new NotFoundError('Trainer save not found for this user');
    }
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'ADD_MONEY',
        entityType: 'USER',
        entityId: userId,
        afterValues: { amount: dto.amount }
      }
    });
    return TrainerMapper.toTrainerSaveDto(result);
  }

  async getAllSpecies(): Promise<AvailableSpeciesDto[]> {
    const species = await this.repo.getAllSpecies();
    return BattleMapper.toAvailableSpeciesDtoList(species);
  }

  async getUserPokemon(userId: string): Promise<OwnedPokemonDto[]> {
    const pokemon = await this.repo.getUserPokemon(userId);
    return pokemon.map(TrainerMapper.toOwnedPokemonDto);
  }

  async addPokemon(adminId: string, userId: string, dto: AddPokemonDto): Promise<OwnedPokemonDto> {
    const { speciesId, level, ivs } = dto;
    if (level < 1 || level > 200) {
      throw new ValidationError('Level must be between 1 and 200');
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
    return TrainerMapper.toOwnedPokemonDto(result);
  }

  async editPokemon(adminId: string, pokemonId: string, dto: any): Promise<OwnedPokemonDto> {
    const { addXp, ivs } = dto;
    const result = await this.repo.editPokemon(pokemonId, addXp, ivs);
    if (!result) {
      throw new NotFoundError('Pokemon not found');
    }
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'EDIT_POKEMON',
        entityType: 'POKEMON',
        entityId: pokemonId,
        afterValues: { addXp, ivs }
      }
    });
    return TrainerMapper.toOwnedPokemonDto(result);
  }
}
