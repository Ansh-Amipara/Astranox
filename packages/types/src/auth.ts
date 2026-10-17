import { z } from 'zod';
import { usernameSchema, emailSchema, passwordSchema } from './common';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  username: usernameSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isBanned?: boolean;
  banReason?: string | null;
  bannedUntil?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
}
