import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const entityIdSchema = z.string().trim().min(1, 'ID is required');

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be 3-20 characters')
  .max(20, 'Username must be 3-20 characters');

export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
