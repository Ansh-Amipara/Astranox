/**
 * Authoritative schema and balance data versions for persisted models.
 */

export const CURRENT_DATA_VERSION = {
  TRAINER_SAVE: 1,
  OWNED_POKEMON: 1,
  INVENTORY_ITEM: 1,
  BATTLE_SESSION: 1,
  SHOP_ITEM: 1,
} as const;

export type DataVersionModel = keyof typeof CURRENT_DATA_VERSION;
