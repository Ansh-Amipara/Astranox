import { z } from 'zod';
import { entityIdSchema } from './common';

export const requestTradeSchema = z.object({
  targetUserId: entityIdSchema,
  offeredPokemonId: entityIdSchema,
  requestedPokemonId: entityIdSchema,
});

export const createListingSchema = z.object({
  pokemonId: entityIdSchema,
  description: z.string().trim().max(200, 'Description must be under 200 characters').optional().nullable(),
});

export const createOfferSchema = z.object({
  pokemonIds: z
    .array(entityIdSchema)
    .min(1, 'At least one Pokémon must be offered')
    .max(6, 'Cannot offer more than 6 Pokémon'),
});

export const listingIdParamSchema = z.object({
  listingId: entityIdSchema,
});

export const offerIdParamSchema = z.object({
  offerId: entityIdSchema,
});

export const tradeIdParamSchema = z.object({
  id: entityIdSchema,
});

export type RequestTradeInput = z.infer<typeof requestTradeSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
