import { z } from 'zod';

export const createArenaTrainerSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, 'Trainer key must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'Key must contain only lowercase letters, numbers, hyphens or underscores'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  targetRank: z.string().trim().min(1, 'Target rank is required'),
  level: z.coerce.number().int().min(1, 'Level must be >= 1').max(5000, 'Max level is 5000'),
  team: z.array(z.string().trim().min(1)).min(1, 'Team must have at least 1 Pokémon').max(6, 'Max 6 Pokémon per team'),
  coins: z.coerce.number().int().min(0, 'Coins cannot be negative').max(100_000_000),
  xp: z.coerce.number().int().min(0, 'XP cannot be negative').max(100_000_000),
  theme: z.string().trim().min(1, 'Theme is required').max(50),
  ratingDelta: z.coerce.number().int().min(1, 'Rating delta must be >= 1').max(500).default(25).optional(),
  cooldownMinutes: z.coerce.number().int().min(0, 'Cooldown cannot be negative').max(10080).default(0).optional(),
  enabled: z.boolean().default(true).optional(),
  sortOrder: z.coerce.number().int().default(0).optional(),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const updateArenaTrainerSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  targetRank: z.string().trim().min(1).optional(),
  level: z.coerce.number().int().min(1).max(5000).optional(),
  team: z.array(z.string().trim().min(1)).min(1).max(6).optional(),
  coins: z.coerce.number().int().min(0).max(100_000_000).optional(),
  xp: z.coerce.number().int().min(0).max(100_000_000).optional(),
  theme: z.string().trim().min(1).max(50).optional(),
  ratingDelta: z.coerce.number().int().min(1).max(500).optional(),
  cooldownMinutes: z.coerce.number().int().min(0).max(10080).optional(),
  enabled: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const archiveArenaTrainerSchema = z.object({
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export interface ArenaTrainerDto {
  id: string;
  key: string;
  name: string;
  targetRank: string;
  level: number;
  team: string[];
  coins: number;
  xp: number;
  theme: string;
  ratingDelta: number;
  cooldownMinutes: number;
  enabled: boolean;
  isArchived: boolean;
  sortOrder: number;
  dataVersion?: number;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateArenaTrainerInput = z.infer<typeof createArenaTrainerSchema>;
export type UpdateArenaTrainerInput = z.infer<typeof updateArenaTrainerSchema>;
export type ArchiveArenaTrainerInput = z.infer<typeof archiveArenaTrainerSchema>;

// --- Rank Definition Schemas & DTOs ---

export const createRankDefinitionSchema = z.object({
  rank: z.string().trim().min(1, 'Rank enum is required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  minLevel: z.coerce.number().int().min(1).max(5000),
  maxLevel: z.coerce.number().int().min(1).max(5000),
  requiredWins: z.coerce.number().int().min(0).default(0).optional(),
  examinerName: z.string().trim().min(2).max(60),
  examinerLevel: z.coerce.number().int().min(1).max(5000),
  examinerAce: z.string().trim().min(1),
  examinerTeam: z.array(z.string().trim().min(1)).min(1).max(6),
  rewardCoins: z.coerce.number().int().min(0).max(100_000_000),
  rewardXp: z.coerce.number().int().min(0).max(100_000_000),
  rewardItems: z.array(z.string().trim().min(1)).default([]).optional(),
  enabled: z.boolean().default(true).optional(),
  sortOrder: z.coerce.number().int().default(0).optional(),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const updateRankDefinitionSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  minLevel: z.coerce.number().int().min(1).max(5000).optional(),
  maxLevel: z.coerce.number().int().min(1).max(5000).optional(),
  requiredWins: z.coerce.number().int().min(0).optional(),
  examinerName: z.string().trim().min(2).max(60).optional(),
  examinerLevel: z.coerce.number().int().min(1).max(5000).optional(),
  examinerAce: z.string().trim().min(1).optional(),
  examinerTeam: z.array(z.string().trim().min(1)).min(1).max(6).optional(),
  rewardCoins: z.coerce.number().int().min(0).max(100_000_000).optional(),
  rewardXp: z.coerce.number().int().min(0).max(100_000_000).optional(),
  rewardItems: z.array(z.string().trim().min(1)).optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export interface RankDefinitionDto {
  id: string;
  rank: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  requiredWins: number;
  examinerName: string;
  examinerLevel: number;
  examinerAce: string;
  examinerTeam: string[];
  rewardCoins: number;
  rewardXp: number;
  rewardItems: string[];
  enabled: boolean;
  sortOrder: number;
  dataVersion?: number;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateRankDefinitionInput = z.infer<typeof createRankDefinitionSchema>;
export type UpdateRankDefinitionInput = z.infer<typeof updateRankDefinitionSchema>;
