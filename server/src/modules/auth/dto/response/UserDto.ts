export interface UserDto {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: 'USER' | 'ADMIN';
}
