import { z } from 'zod';


export const battleActionSchema = z.union([
  z.literal('run'),
  z.string().regex(/^move:[1-9]\d*$/, 'Invalid move action format'),
  z.string().regex(/^switch:[a-zA-Z0-9_-]+$/, 'Invalid switch action format'),
  z.enum([
    'item:poke-ball',
    'item:great-ball',
    'item:ultra-ball',
    'item:luxury-ball',
    'item:master-ball',
  ]),
  z.literal('skip_move'),
  z.string().regex(/^learn_move:[0-3]$/, 'Invalid learn move action format'),
]);

export const submitTurnSchema = z.object({
  action: battleActionSchema,
});

export const engageCustomSchema = z.object({
  speciesId: z.coerce.number().int().positive('Species ID must be positive'),
  level: z.coerce.number().int().min(1, 'Level must be at least 1').max(20000, 'Level cannot exceed 20000'),
  battleType: z.enum(['WILD', 'NPC', 'TOWER', 'RIFT', 'EVOLVE']).optional(),
});

export const arenaEncounterSchema = z.object({
  trainerId: z.string().trim().min(1, 'Trainer ID is required'),
});

export const socketSubmitTurnSchema = z.object({
  action: battleActionSchema,
});

export const playerBattleActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('USE_MOVE'),
    moveId: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('SWITCH_POKEMON'),
    targetPokemonId: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal('THROW_BALL'),
    ballType: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal('USE_ITEM'),
    itemId: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal('RUN'),
  }),
]);

export const battleActionIntentSchema = z.object({
  battleId: z.string().trim().min(1),
  action: playerBattleActionSchema,
});

export type BattleActionInput = z.infer<typeof battleActionSchema>;
export type SubmitTurnInput = z.infer<typeof submitTurnSchema>;
export type EngageCustomInput = z.infer<typeof engageCustomSchema>;
export type ArenaEncounterInput = z.infer<typeof arenaEncounterSchema>;
export type SocketSubmitTurnInput = z.infer<typeof socketSubmitTurnSchema>;
export type PlayerBattleActionInput = z.infer<typeof playerBattleActionSchema>;
export type BattleActionIntentInput = z.infer<typeof battleActionIntentSchema>;
