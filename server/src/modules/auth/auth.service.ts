import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import type { LoginDto } from './dto/request/LoginDto';
import type { RegisterDto } from './dto/request/RegisterDto';
import type { AuthResultDto } from './dto/response/LoginResponseDto';
import { AuthMapper } from './dto/mapper';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../core/utils/jwt';
import { ValidationError, UnauthorizedError } from '../../core/errors/AppError';

export class AuthService {
  private repo: AuthRepository;

  constructor() {
    this.repo = new AuthRepository();
  }

  async register(input: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.repo.findByUsername(input.username);
    if (existingUser) {
      throw new ValidationError('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    
    await this.repo.createUser({
      username: input.username,
      email: input.email,
      passwordHash,
    });

    return { message: 'User registered successfully' };
  }

  async login(input: LoginDto): Promise<AuthResultDto> {
    const user = await this.repo.findByUsername(input.username);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const userDto = AuthMapper.toUserDto(user);

    const accessToken = generateAccessToken(userDto);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.repo.updateRefreshToken(user.id, refreshTokenHash);

    return {
      auth: { accessToken, user: userDto },
      refreshToken,
    };
  }

  async refresh(token: string): Promise<AuthResultDto> {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await this.repo.findById(decoded.id);
      
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(token, user.refreshTokenHash);
      if (!isValid) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const userDto = AuthMapper.toUserDto(user);

      const accessToken = generateAccessToken(userDto);
      const newRefreshToken = generateRefreshToken(user.id);
      const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

      await this.repo.updateRefreshToken(user.id, refreshTokenHash);

      return {
        auth: { accessToken, user: userDto },
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.repo.updateRefreshToken(userId, null);
  }

  async updateProfile(userId: string, input: { username: string }): Promise<{ accessToken: string, user: any }> {
    const existing = await this.repo.findByUsername(input.username);
    if (existing && existing.id !== userId) {
      throw new ValidationError('Username is already taken');
    }
    
    try {
      const updatedUser = await this.repo.updateProfile(userId, input);
      const userDto = AuthMapper.toUserDto(updatedUser);
      const accessToken = generateAccessToken(userDto);
      
      return { accessToken, user: userDto };
    } catch (err: any) {
      if (err.code === 'P2002') { // Prisma unique constraint violation
        throw new ValidationError('Username is already taken');
      }
      throw err;
    }
  }
}
