import { z } from 'zod';

export const requestTradeSchema = z.object({
  body: z.object({
    targetUserId: z.string().uuid(),
    offeredPokemonId: z.string().uuid(),
    requestedPokemonId: z.string().uuid()
  })
});
