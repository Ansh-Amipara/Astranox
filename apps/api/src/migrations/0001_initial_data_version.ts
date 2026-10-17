import { Migration } from './types';
import { CURRENT_DATA_VERSION } from '@astranox/constants';

/**
 * Migration 0001: Ensure baseline dataVersion is stamped on all existing documents.
 */
export const migration0001: Migration = {
  id: '0001_initial_data_version',
  description: 'Ensure baseline dataVersion: 1 on TrainerSave, OwnedPokemon, InventoryItem, and BattleSession',
  up: async ({ prisma, logger }) => {
    logger.info('[Migration 0001] Checking and applying baseline dataVersion...');

    // Idempotent: sets dataVersion = 1 if missing or 0
    const [trainers, pokemon, inventory, battles] = await Promise.all([
      prisma.trainerSave.updateMany({
        where: { dataVersion: { lt: CURRENT_DATA_VERSION.TRAINER_SAVE } },
        data: { dataVersion: CURRENT_DATA_VERSION.TRAINER_SAVE },
      }),
      prisma.ownedPokemon.updateMany({
        where: { dataVersion: { lt: CURRENT_DATA_VERSION.OWNED_POKEMON } },
        data: { dataVersion: CURRENT_DATA_VERSION.OWNED_POKEMON },
      }),
      prisma.inventoryItem.updateMany({
        where: { dataVersion: { lt: CURRENT_DATA_VERSION.INVENTORY_ITEM } },
        data: { dataVersion: CURRENT_DATA_VERSION.INVENTORY_ITEM },
      }),
      prisma.battleSession.updateMany({
        where: { dataVersion: { lt: CURRENT_DATA_VERSION.BATTLE_SESSION } },
        data: { dataVersion: CURRENT_DATA_VERSION.BATTLE_SESSION },
      }),
    ]);

    logger.info(
      `[Migration 0001] Updated: ${trainers.count} trainers, ${pokemon.count} pokemon, ${inventory.count} inventory items, ${battles.count} battle sessions.`
    );
  },
  down: async ({ logger }) => {
    logger.warn('[Migration 0001] Rollback requested: No-op because dataVersion defaults are non-destructive.');
  },
};
