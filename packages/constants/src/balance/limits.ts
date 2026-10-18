import { z } from 'zod';

/**
 * Limit and boundary constants across gameplay and infrastructure.
 */

export const limitsBalanceSchema = z.object({
  MAX_PARTY_SIZE: z.number().min(1).max(12).describe('Maximum number of Pokémon in an active party'),
  MAX_EQUIPPED_MOVES: z.number().min(1).max(8).describe('Maximum equipped move slots per Pokémon'),
  MAX_POKEMON_PER_BOX: z.number().min(10).max(100).describe('Maximum Pokémon stored per PC box'),
  MAX_STORAGE_BOXES: z.number().min(1).max(100).describe('Total number of storage boxes'),
  DEFAULT_PAGE_SIZE: z.number().min(10).max(100).describe('Default pagination limit for list queries'),
  MAX_PAGE_SIZE: z.number().min(10).max(200).describe('Maximum pagination limit for list queries'),
  IDEMPOTENCY_TTL_SECONDS: z.number().min(60).max(604800).describe('Maximum duration an idempotency key response remains cached in seconds'),
  DEFAULT_LOCK_DURATION_MS: z.number().min(500).max(60000).describe('Default distributed lock timeout in milliseconds'),
});

export type LimitsBalanceConfig = z.infer<typeof limitsBalanceSchema>;

export const LIMIT_CONSTANTS = {
  /** Maximum number of Pokémon in an active party */
  MAX_PARTY_SIZE: 6,

  /** Maximum equipped move slots per Pokémon */
  MAX_EQUIPPED_MOVES: 4,

  /** Maximum Pokémon stored per PC box */
  MAX_POKEMON_PER_BOX: 30,

  /** Total number of storage boxes */
  MAX_STORAGE_BOXES: 32,

  /** Default pagination limit for list queries */
  DEFAULT_PAGE_SIZE: 50,

  /** Maximum pagination limit for list queries */
  MAX_PAGE_SIZE: 100,

  /** Maximum duration an idempotency key response remains cached (24 hours) */
  IDEMPOTENCY_TTL_SECONDS: 86400,

  /** Default distributed lock timeout in milliseconds */
  DEFAULT_LOCK_DURATION_MS: 5000,
} as const;
