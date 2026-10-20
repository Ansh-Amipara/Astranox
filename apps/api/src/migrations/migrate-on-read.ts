import { CURRENT_DATA_VERSION, DataVersionModel, getLevelFromXp, getMaxLevelForPotential } from '@astranox/constants';
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
  const migrated: any = {
    ...record,
    dataVersion: targetVersion,
  };

  // Specific transform: recalculate Pokémon level based on currentXp
  if (model === 'OWNED_POKEMON' && currentVersion < 2) {
    const rawPkm = record as any;
    if (typeof rawPkm.currentXp === 'number') {
      const maxLvl = rawPkm.potential ? getMaxLevelForPotential(rawPkm.potential) : 5000;
      migrated.level = getLevelFromXp(rawPkm.currentXp, undefined, maxLvl);
    }
  }

  // Asynchronous background persistence to MongoDB
  persistMigratedRecord(model, record.id, targetVersion, (migrated as any).level).catch((err) => {
    logger.warn({ err, model, id: record.id }, '[MigrateOnRead] Failed background version persist');
  });

  return migrated as T;
}

async function persistMigratedRecord(model: DataVersionModel, id: string, version: number, calculatedLevel?: number): Promise<void> {
  // If id is not a valid 24-char hex ObjectId (e.g. In-memory mock/test ID), skip DB update
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return;

  switch (model) {
    case 'OWNED_POKEMON':
      await prisma.ownedPokemon.update({
        where: { id },
        data: {
          dataVersion: version,
          ...(typeof calculatedLevel === 'number' ? { level: calculatedLevel } : {}),
        },
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
