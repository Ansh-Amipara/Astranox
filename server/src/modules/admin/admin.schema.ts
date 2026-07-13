import { z } from 'zod';

export const addMoneySchema = z.object({
  body: z.object({
    amount: z.number().int().positive()
  })
});

export const addPokemonSchema = z.object({
  body: z.object({
    speciesId: z.number().int().positive(),
    level: z.number().int().min(1).max(100),
    ivs: z.object({
      ivHp: z.number().int().min(0).max(31).optional(),
      ivAttack: z.number().int().min(0).max(31).optional(),
      ivDefense: z.number().int().min(0).max(31).optional(),
      ivSpAtk: z.number().int().min(0).max(31).optional(),
      ivSpDef: z.number().int().min(0).max(31).optional(),
      ivSpeed: z.number().int().min(0).max(31).optional(),
    }).optional()
  })
});
