import { CURRENT_DATA_VERSION, DataVersionModel } from '@astranox/constants';
import { prisma } from '../core/db/prisma';
import { logger } from '../config/logger';

/**
 * Checks if a persisted document's dataVersion is behind the authoritative version,
 * applies any in-memory transformations if necessary, and schedules a background persist.
 */
export function migrateOnRead<T extends { id: string; dataVersion?: number | null }>(
  model: DataVersionModel,
  record: T
): T {
  const targetVersion = CURRENT_DATA_VERSION[model];
  const currentVersion = record.dataVersion ?? 0;

  if (currentVersion >= targetVersion) {
    return record;
  }

  logger.debug(
    `[MigrateOnRead] Auto-migrating ${model} record ${record.id} from v${currentVersion} to v${targetVersion}`
  );

  // In-memory upgrade
  const migrated = {
    ...record,
    dataVersion: targetVersion,
  };

  // Asynchronous background persistence to MongoDB
  persistMigratedRecord(model, record.id, targetVersion).catch((err) => {
    logger.warn({ err, model, id: record.id }, '[MigrateOnRead] Failed background version persist');
  });

  return migrated;
}

async function persistMigratedRecord(model: DataVersionModel, id: string, version: number): Promise<void> {
  switch (model) {
    case 'OWNED_POKEMON':
      await prisma.ownedPokemon.update({
        where: { id },
        data: { dataVersion: version },
      });
      break;
    case 'TRAINER_SAVE':
      await prisma.trainerSave.update({
        where: { id },
        data: { dataVersion: version },
      });
      break;
    case 'INVENTORY_ITEM':
      await prisma.inventoryItem.update({
        where: { id },
        data: { dataVersion: version },
      });
      break;
    case 'BATTLE_SESSION':
      await prisma.battleSession.update({
        where: { id },
        data: { dataVersion: version },
      });
      break;
    case 'SHOP_ITEM':
      await prisma.shopItem.update({
        where: { id },
        data: { dataVersion: version },
      });
      break;
  }
}
