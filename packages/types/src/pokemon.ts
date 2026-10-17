import { z } from 'zod';
import { entityIdSchema } from './common';

export const pickStarterSchema = z.object({
  speciesId: z.coerce.number().int().positive('Species ID must be a valid positive integer'),
});

export const pokemonIdParamSchema = z.object({
  pokemonId: entityIdSchema,
});

export const addToPartySchema = z.object({
  position: z.coerce.number().int().min(0).max(5, 'Valid party position (0-5) is required'),
});

export const slotPositionSchema = z.object({
  isParty: z.boolean(),
  position: z.coerce.number().int().min(0),
});

export const swapSlotsSchema = z.object({
  from: slotPositionSchema,
  to: slotPositionSchema,
});

export const changeMovesSchema = z.object({
  moves: z
    .array(z.union([z.number(), z.string()]))
    .transform((arr) => arr.map(Number))
    .refine((arr) => !arr.some(isNaN) && arr.length >= 1 && arr.length <= 4, {
      message: 'Provide between 1 and 4 valid numeric move IDs',
    }),
});

export const evolvePokemonSchema = z.object({
  targetSpeciesId: z.coerce.number().int().positive().optional(),
});

export const boostPotentialSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required'),
});

export const boostIvSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required'),
  stat: z.enum(['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'], {
    errorMap: () => ({ message: 'Valid stat (hp, attack, defense, spAtk, spDef, speed) is required' }),
  }),
});

export const distributeXpSchema = z.object({
  pokemonId: entityIdSchema,
  amount: z
    .union([z.number(), z.string()])
    .transform(Number)
    .refine((n) => !isNaN(n) && n > 0, {
      message: 'XP amount must be a positive number',
    }),
});

export type PickStarterInput = z.infer<typeof pickStarterSchema>;
export type AddToPartyInput = z.infer<typeof addToPartySchema>;
export type SwapSlotsInput = z.infer<typeof swapSlotsSchema>;
export type ChangeMovesInput = z.infer<typeof changeMovesSchema>;
export type EvolvePokemonInput = z.infer<typeof evolvePokemonSchema>;
export type BoostPotentialInput = z.infer<typeof boostPotentialSchema>;
export type BoostIvInput = z.infer<typeof boostIvSchema>;
export type DistributeXpInput = z.infer<typeof distributeXpSchema>;
