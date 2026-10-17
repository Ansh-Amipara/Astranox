import { injectable } from 'tsyringe';
import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import type { LoginDto } from './dto/request/LoginDto';
import type { RegisterDto } from './dto/request/RegisterDto';
import type { AuthResultDto } from './dto/response/LoginResponseDto';
import { AuthMapper } from './dto/mapper';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../../core/utils/jwt';
import { ValidationError, UnauthorizedError } from '../../core/errors/AppError';
import { logger } from '../../config/logger';
import { AuditService } from '../../core/services/audit.service';

@injectable()
export class AuthService {
  constructor(
    private repo: AuthRepository,
    private auditService: AuditService
  ) {}

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

  async login(
    input: LoginDto,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<AuthResultDto> {
    const user = await this.repo.findByUsername(input.username);
    if (!user) {
      await this.auditService.logAuthAttempt({
        action: 'LOGIN_FAILURE',
        actorType: 'user',
        ip: meta?.ip,
        reason: 'User not found',
        meta: { username: input.username, userAgent: meta?.userAgent },
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      await this.auditService.logAuthAttempt({
        action: 'LOGIN_FAILURE',
        actorId: user.id,
        actorType: 'user',
        ip: meta?.ip,
        reason: 'Invalid password',
        meta: { username: input.username, userAgent: meta?.userAgent },
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    await this.auditService.logAuthAttempt({
      action: 'LOGIN_SUCCESS',
      actorId: user.id,
      actorType: user.role === 'ADMIN' ? 'admin' : 'user',
      ip: meta?.ip,
      meta: { username: input.username, userAgent: meta?.userAgent },
    });

    const userDto = AuthMapper.toUserDto(user);
    const accessToken = generateAccessToken(userDto);
    const refreshToken = generateRefreshToken(user.id);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    });

    await this.repo.updateRefreshToken(user.id, tokenHash);

    return {
      auth: { accessToken, user: userDto },
      refreshToken,
    };
  }

  async refresh(
    token: string,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<AuthResultDto> {
    let decoded: { id: string };
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(token);
    const storedToken = await this.repo.findRefreshTokenByHash(tokenHash);

    if (!storedToken) {
      // Fallback for legacy user.refreshTokenHash
      const user = await this.repo.findById(decoded.id);
      if (!user || user.refreshTokenHash !== tokenHash) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const userDto = AuthMapper.toUserDto(user);
      const accessToken = generateAccessToken(userDto);
      const newRefreshToken = generateRefreshToken(user.id);
      const newTokenHash = hashToken(newRefreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.repo.createRefreshToken({
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt,
        userAgent: meta?.userAgent,
        ip: meta?.ip,
      });
      await this.repo.updateRefreshToken(user.id, newTokenHash);

      return {
        auth: { accessToken, user: userDto },
        refreshToken: newRefreshToken,
      };
    }

    // Reuse detection: if a revoked token is reused, revoke the whole family
    if (storedToken.revokedAt) {
      logger.warn(
        `🚨 Refresh token reuse detected for user ${storedToken.userId}! Revoking all sessions.`
      );
      await this.repo.revokeAllUserRefreshTokens(storedToken.userId);
      await this.repo.updateRefreshToken(storedToken.userId, null);
      throw new UnauthorizedError('Token reuse detected. All sessions revoked.');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.repo.revokeRefreshToken(storedToken.id);
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = storedToken.user;
    const userDto = AuthMapper.toUserDto(user);
    const accessToken = generateAccessToken(userDto);
    const newRefreshToken = generateRefreshToken(user.id);
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Rotate: revoke current and link to new
    await this.repo.revokeRefreshToken(storedToken.id, newTokenHash);

    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    });
    await this.repo.updateRefreshToken(user.id, newTokenHash);

    return {
      auth: { accessToken, user: userDto },
      refreshToken: newRefreshToken,
    };
  }

  async logout(token?: string, userId?: string): Promise<void> {
    if (token) {
      const tokenHash = hashToken(token);
      const storedToken = await this.repo.findRefreshTokenByHash(tokenHash);
      if (storedToken) {
        await this.repo.revokeRefreshToken(storedToken.id);
      }
    }
    if (userId) {
      await this.repo.updateRefreshToken(userId, null);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repo.revokeAllUserRefreshTokens(userId);
    await this.repo.updateRefreshToken(userId, null);
  }

  async updateProfile(
    userId: string,
    input: { username: string }
  ): Promise<{ accessToken: string; user: any }> {
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
      if (err.code === 'P2002') {
        throw new ValidationError('Username is already taken');
      }
      throw err;
    }
  }
}
