import { z } from 'zod';

export const engageCustomSchema = z.object({
  body: z.object({
    speciesId: z.number().positive(),
    level: z.number().min(1).max(100),
  })
});

const battleActionSchema = z.union([
  z.literal('run'),
  z.string().regex(/^move:[1-9]\d*$/, 'Invalid move action'),
  z.string().regex(/^switch:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, 'Invalid switch action'),
  z.enum([
    'item:poke-ball',
    'item:great-ball',
    'item:ultra-ball',
    'item:luxury-ball',
    'item:master-ball'
  ])
]);

export const submitTurnSchema = z.object({
  body: z.object({
    action: battleActionSchema
  })
});
