import { z } from 'zod';

export const pickStarterSchema = z.object({
  body: z.object({
    speciesId: z.number().int().positive('speciesId must be a valid number')
  })
});

export const pokemonIdParamSchema = z.object({
  params: z.object({
    pokemonId: z.string().min(1, 'Pokemon ID is required')
  })
});

export const addToPartySchema = pokemonIdParamSchema.extend({
  body: z.object({
    position: z.number().int().min(0).max(5, 'Valid party position (0-5) is required')
  })
});

const slotPositionSchema = z.object({
  isParty: z.boolean(),
  position: z.number().int().min(0)
});

export const swapSlotsSchema = z.object({
  body: z.object({
    from: slotPositionSchema,
    to: slotPositionSchema
  })
});

export const changeMovesSchema = pokemonIdParamSchema.extend({
  body: z.object({
    moves: z.array(z.union([z.number(), z.string()])).transform(arr => arr.map(Number)).refine(arr => !arr.some(isNaN), { message: 'All moves must be valid numeric IDs' })
  })
});

export const evolvePokemonSchema = pokemonIdParamSchema.extend({
  body: z.object({
    targetSpeciesId: z.number().int().positive().optional()
  }).optional().default({})
});

export const boostPotentialSchema = pokemonIdParamSchema.extend({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required')
  })
});

export const boostIvSchema = pokemonIdParamSchema.extend({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    stat: z.string().min(1, 'Stat is required')
  })
});

export const distributeXpSchema = z.object({
  body: z.object({
    pokemonId: z.string().min(1, 'Pokemon ID is required'),
    amount: z.union([z.number(), z.string()]).transform(Number).refine(n => !isNaN(n) && n > 0, { message: 'Amount must be a positive number' })
  })
});
