import jwt from 'jsonwebtoken';
import type { UserPayload } from '@astranox/shared';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

export const generateAccessToken = (user: UserPayload): string => {
  return jwt.sign(user, ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): UserPayload => {
  return jwt.verify(token, ACCESS_SECRET) as UserPayload;
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, REFRESH_SECRET) as { id: string };
};
