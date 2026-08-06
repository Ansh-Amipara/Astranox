import { z } from 'zod';

export const buyItemSchema = z.object({
  body: z.object({
    itemId: z.string(),
    quantity: z.number().int().positive(),
  })
});

export const buyMoveSchema = z.object({
  body: z.object({
    moveId: z.number().int().positive(),
  })
});

export const buyBulkSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().int().positive(),
    })).min(1),
  })
});
