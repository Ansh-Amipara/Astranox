import { z } from 'zod';

export const engageCustomSchema = z.object({
  body: z.object({
    speciesId: z.number().positive(),
    level: z.number().min(1).max(20000),
    battleType: z.enum(['WILD', 'NPC', 'TOWER', 'RIFT', 'EVOLVE']).optional(),
  })
});

const battleActionSchema = z.union([
  z.literal('run'),
  z.string().regex(/^move:[1-9]\d*$/, 'Invalid move action'),
  z.string().startsWith('switch:', 'Invalid switch action'),
  z.enum([
    'item:poke-ball',
    'item:great-ball',
    'item:ultra-ball',
    'item:luxury-ball',
    'item:master-ball'
  ]),
  z.literal('skip_move'),
  z.string().regex(/^learn_move:[0-3]$/, 'Invalid learn move action')
]);

export const submitTurnSchema = z.object({
  body: z.object({
    action: battleActionSchema
  })
});
