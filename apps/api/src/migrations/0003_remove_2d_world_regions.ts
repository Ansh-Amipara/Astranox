import { Migration } from './types';

/**
 * Migration 0003: Clean up legacy 2D WorldRegion collection and remove 2D map fields from TrainerSave.
 */
export const migration0003: Migration = {
  id: '0003_remove_2d_world_regions',
  description: 'Drop WorldRegion collection and unset 2D map coordinates from TrainerSave',
  up: async ({ prisma, logger }) => {
    logger.info('[Migration 0003] Cleaning up legacy 2D exploration data...');

    // 1. Drop or clear WorldRegion collection
    try {
      await prisma.$runCommandRaw({
        drop: 'WorldRegion',
      });
      logger.info('[Migration 0003] Dropped WorldRegion collection in MongoDB.');
    } catch (err: any) {
      if (err?.codeName === 'NamespaceNotFound' || err?.message?.includes('not found')) {
        logger.info('[Migration 0003] WorldRegion collection already removed or not present.');
      } else {
        logger.warn('[Migration 0003] Note on dropping WorldRegion:', err?.message || err);
      }
    }

    // 2. Unset 2D fields from TrainerSave documents
    try {
      await prisma.$runCommandRaw({
        update: 'TrainerSave',
        updates: [
          {
            q: {},
            u: {
              $unset: {
                currentMapId: '',
                posX: '',
                posY: '',
                facing: '',
                lastHealMapId: '',
                lastHealX: '',
                lastHealY: '',
                stepsSinceEncounter: '',
              },
            },
            multi: true,
          },
        ],
      });
      logger.info('[Migration 0003] Successfully unset 2D map coordinates from TrainerSave documents.');
    } catch (err: any) {
      logger.error('[Migration 0003] Error unsetting 2D fields from TrainerSave:', err);
    }
  },
  down: async ({ logger }) => {
    logger.warn('[Migration 0003] Rollback requested: 2D coordinates were removed. Default coordinates will be applied if legacy models are restored.');
  },
};
