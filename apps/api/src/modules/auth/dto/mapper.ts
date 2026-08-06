import type { UserDto } from './response/UserDto';
import type { User } from '@prisma/client';

export class AuthMapper {
  static toUserDto(entity: User): UserDto {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      role: entity.role as 'USER' | 'ADMIN',
    };
  }
}
