/**
 * Limit and boundary constants across gameplay and infrastructure.
 */

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
