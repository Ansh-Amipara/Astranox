import type { UserDto } from './UserDto';

export interface LoginResponseDto {
  readonly accessToken: string;
  readonly user: UserDto;
}

export interface AuthResultDto {
  readonly auth: LoginResponseDto;
  readonly refreshToken: string;
}
