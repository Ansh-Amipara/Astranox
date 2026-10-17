import { z } from 'zod';
import { entityIdSchema } from './common';

export const addMoneySchema = z.object({
  amount: z.coerce.number().int().positive('Amount must be positive'),
  currencyType: z.enum(['astralCoins', 'infinityCoins']).default('astralCoins'),
});

export const addPokemonSchema = z.object({
  speciesId: z.coerce.number().int().positive('Species ID must be positive'),
  level: z.coerce.number().int().min(1, 'Level must be at least 1').max(5000, 'Level cannot exceed 5000'),
  potential: z.string().trim().min(1, 'Potential is required'),
  ivs: z
    .object({
      ivHp: z.number().int().min(0).max(31).optional(),
      ivAttack: z.number().int().min(0).max(31).optional(),
      ivDefense: z.number().int().min(0).max(31).optional(),
      ivSpAtk: z.number().int().min(0).max(31).optional(),
      ivSpDef: z.number().int().min(0).max(31).optional(),
      ivSpeed: z.number().int().min(0).max(31).optional(),
    })
    .optional(),
});

export const editPokemonSchema = z.object({
  potential: z.string().optional(),
  addXp: z.coerce.number().int().positive().optional(),
  ivs: z
    .object({
      ivHp: z.number().int().min(0).max(31).optional(),
      ivAttack: z.number().int().min(0).max(31).optional(),
      ivDefense: z.number().int().min(0).max(31).optional(),
      ivSpAtk: z.number().int().min(0).max(31).optional(),
      ivSpDef: z.number().int().min(0).max(31).optional(),
      ivSpeed: z.number().int().min(0).max(31).optional(),
    })
    .optional(),
});

export const adminUserIdParamSchema = z.object({
  id: entityIdSchema,
});

export const adminPokemonParamSchema = z.object({
  id: entityIdSchema,
  pokemonId: entityIdSchema,
});

export type AddMoneyInput = z.infer<typeof addMoneySchema>;
export type AddPokemonInput = z.infer<typeof addPokemonSchema>;
export type EditPokemonInput = z.infer<typeof editPokemonSchema>;
