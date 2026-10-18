import { z } from 'zod';
import { entityIdSchema } from './common';

export const createEventSchema = z.object({
  name: z.string().trim().min(2, 'Event name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(500, 'Description must be under 500 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean().default(false),
  taskType: z.enum(['CLEAR_RIFT', 'CLEAR_TOWER', 'CAPTURE_POKEMON', 'DEFEAT_WILD_POKEMON']),
  taskConfig: z.any().optional(),
  rewardConfig: z.any().optional(),
  pokemonPool: z.any().optional(),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const updateEventSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(5).max(500).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  taskType: z.enum(['CLEAR_RIFT', 'CLEAR_TOWER', 'CAPTURE_POKEMON', 'DEFEAT_WILD_POKEMON']).optional(),
  taskConfig: z.any().optional(),
  rewardConfig: z.any().optional(),
  pokemonPool: z.any().optional(),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const archiveEventSchema = z.object({
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const claimEventRewardParamSchema = z.object({
  id: entityIdSchema,
});

export interface EventChallengeDto {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  taskType: 'CLEAR_RIFT' | 'CLEAR_TOWER' | 'CAPTURE_POKEMON' | 'DEFEAT_WILD_POKEMON';
  taskConfig: any;
  rewardConfig: any;
  pokemonPool?: any;
  dataVersion?: number;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ArchiveEventInput = z.infer<typeof archiveEventSchema>;
