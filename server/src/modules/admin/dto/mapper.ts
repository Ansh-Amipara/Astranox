import type { AdminUserDto } from './response/AdminUserDto';

export class AdminMapper {
  static toAdminUserDto(entity: any): AdminUserDto {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      role: entity.role,
      createdAt: entity.createdAt,
      trainerSave: entity.trainerSave,
    };
  }

  static toAdminUserDtoList(entities: any[]): AdminUserDto[] {
    return entities.map(AdminMapper.toAdminUserDto);
  }
}
