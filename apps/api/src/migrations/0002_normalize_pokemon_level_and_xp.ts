import { Migration } from './types';
import { CURRENT_DATA_VERSION, getLevelFromXp, getMaxLevelForPotential } from '@astranox/constants';

/**
 * Migration 0002: Normalize OwnedPokemon levels and XP to flat 100 XP per level and bump dataVersion to 2.
 */
export const migration0002: Migration = {
  id: '0002_normalize_pokemon_level_and_xp',
  description: 'Normalize OwnedPokemon level based on flat 100 XP per level and update dataVersion to 2',
  up: async ({ prisma, logger }) => {
    logger.info('[Migration 0002] Normalizing OwnedPokemon level and XP formulas to v2...');

    const legacyPokemon = await prisma.ownedPokemon.findMany({
      where: { dataVersion: { lt: CURRENT_DATA_VERSION.OWNED_POKEMON } },
      select: {
        id: true,
        currentXp: true,
        level: true,
        potential: true,
      },
    });

    logger.info(`[Migration 0002] Found ${legacyPokemon.length} Pokémon records needing normalization.`);

    for (const pkm of legacyPokemon) {
      const maxLvl = getMaxLevelForPotential(pkm.potential);
      const normalizedLevel = getLevelFromXp(pkm.currentXp, undefined, maxLvl);

      await prisma.ownedPokemon.update({
        where: { id: pkm.id },
        data: {
          level: normalizedLevel,
          dataVersion: CURRENT_DATA_VERSION.OWNED_POKEMON,
        },
      });
    }

    logger.info(`[Migration 0002] Completed normalization of ${legacyPokemon.length} Pokémon.`);
  },
  down: async ({ logger }) => {
    logger.warn('[Migration 0002] Rollback requested: No-op because level normalization is forward-preserving.');
  },
};
