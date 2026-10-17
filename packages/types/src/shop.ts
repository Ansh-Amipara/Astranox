import { z } from 'zod';
import { entityIdSchema } from './common';

export const buyItemSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

export const buyMoveSchema = z.object({
  moveId: z.coerce.number().int().positive('Move ID must be a positive integer'),
});

export const buyBulkSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string().trim().min(1, 'Item ID is required'),
        quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
});

export const useItemSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required'),
  targetPokemonId: entityIdSchema.optional(),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1').default(1),
});

export type BuyItemInput = z.infer<typeof buyItemSchema>;
export type BuyMoveInput = z.infer<typeof buyMoveSchema>;
export type BuyBulkInput = z.infer<typeof buyBulkSchema>;
export type UseItemInput = z.infer<typeof useItemSchema>;
