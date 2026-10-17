import { z } from 'zod';
import { entityIdSchema } from './common';

export const startTowerBattleSchema = z.object({
  playerActivePokemonId: entityIdSchema.optional(),
});

export const completeTowerBattleSchema = z.object({
  result: z.enum(['WON', 'LOST'], {
    errorMap: () => ({ message: 'Result must be either WON or LOST' }),
  }),
});

export type StartTowerBattleInput = z.infer<typeof startTowerBattleSchema>;
export type CompleteTowerBattleInput = z.infer<typeof completeTowerBattleSchema>;
