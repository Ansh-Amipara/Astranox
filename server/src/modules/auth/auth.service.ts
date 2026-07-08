import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import type { RegisterInput, LoginInput, AuthResponse, UserPayload } from '@astranox/shared';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { ValidationError, UnauthorizedError } from '../../common/errors/AppError';

export class AuthService {
  private repo: AuthRepository;

  constructor() {
    this.repo = new AuthRepository();
  }

  async register(input: RegisterInput): Promise<{ message: string }> {
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

  async login(input: LoginInput): Promise<{ auth: AuthResponse, refreshToken: string }> {
    const user = await this.repo.findByUsername(input.username);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const userPayload: UserPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.repo.updateRefreshToken(user.id, refreshTokenHash);

    return {
      auth: { accessToken, user: userPayload },
      refreshToken,
    };
  }

  async refresh(token: string): Promise<{ auth: AuthResponse, refreshToken: string }> {
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

      const userPayload: UserPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(userPayload);
      const newRefreshToken = generateRefreshToken(user.id);
      const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

      await this.repo.updateRefreshToken(user.id, refreshTokenHash);

      return {
        auth: { accessToken, user: userPayload },
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.repo.updateRefreshToken(userId, null);
  }
}
