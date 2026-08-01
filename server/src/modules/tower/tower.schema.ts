import { z } from 'zod';

export const startBattleSchema = z.object({
  body: z.object({
    playerActivePokemonId: z.string().optional()
  })
});

export const completeBattleSchema = z.object({
  body: z.object({
    result: z.enum(['WON', 'LOST'])
  })
});
