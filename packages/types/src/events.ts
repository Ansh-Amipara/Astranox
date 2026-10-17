import { z } from 'zod';
import { entityIdSchema } from './common';

export const createEventSchema = z.object({
  name: z.string().trim().min(1, 'Event name is required').max(100, 'Name must be under 100 characters'),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description must be under 500 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean().default(false),
  taskType: z.string().trim().min(1, 'Task type is required'),
  taskConfig: z.any().optional(),
  rewardConfig: z.any().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const claimEventRewardParamSchema = z.object({
  id: entityIdSchema,
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
