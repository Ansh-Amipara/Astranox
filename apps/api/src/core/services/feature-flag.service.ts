import { singleton } from 'tsyringe';
import { prisma } from '../db/prisma';
import { CacheService } from './cache.service';
import { FEATURE_FLAGS } from '@astranox/constants';
import type { FeatureFlagDto } from '@astranox/types';

@singleton()
export class FeatureFlagService {
  private readonly CACHE_PREFIX = 'ff:';
  private readonly CACHE_TTL_SECONDS = 60; // 1 minute TTL

  constructor(private cache: CacheService) {}

  /**
   * Evaluates if a feature flag is enabled.
   * Supports target user whitelist (allowUserIds) and deterministic percentage rollouts.
   */
  async isEnabled(flagKey: string, userId?: string): Promise<boolean> {
    const cacheKey = `${this.CACHE_PREFIX}${flagKey}`;
    let flag = await this.cache.get<any>(cacheKey);

    if (!flag) {
      const dbFlag = await prisma.featureFlag.findUnique({
        where: { key: flagKey },
      });

      if (dbFlag) {
        flag = {
          enabled: dbFlag.enabled,
          rolloutPercent: dbFlag.rolloutPercent,
          allowUserIds: dbFlag.allowUserIds || [],
        };
      } else {
        const defaultDef = FEATURE_FLAGS.find((f) => f.key === flagKey);
        flag = {
          enabled: defaultDef ? defaultDef.defaultValue : true,
          rolloutPercent: null,
          allowUserIds: [],
        };
      }

      await this.cache.set(cacheKey, flag, this.CACHE_TTL_SECONDS);
    }

    if (!flag.enabled) {
      return false;
    }

    // Explicit user whitelist bypasses percentage rollout
    if (userId && Array.isArray(flag.allowUserIds) && flag.allowUserIds.includes(userId)) {
      return true;
    }

    // Rollout percentage check
    if (typeof flag.rolloutPercent === 'number' && flag.rolloutPercent >= 0 && flag.rolloutPercent < 100) {
      if (!userId) {
        return false;
      }
      // Deterministic hash based on userId and flagKey
      let hash = 0;
      const str = `${flagKey}:${userId}`;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const score = Math.abs(hash) % 100;
      return score < flag.rolloutPercent;
    }

    return true;
  }

  async getAllFlags(): Promise<FeatureFlagDto[]> {
    const dbFlags = await prisma.featureFlag.findMany();
    const dbMap = new Map(dbFlags.map((f) => [f.key, f]));

    return FEATURE_FLAGS.map((def) => {
      const dbFlag = dbMap.get(def.key);
      return {
        key: def.key,
        name: def.name,
        description: def.description,
        enabled: dbFlag ? dbFlag.enabled : def.defaultValue,
        updatedBy: dbFlag?.updatedBy || null,
        updatedAt: dbFlag?.updatedAt ? dbFlag.updatedAt.toISOString() : null,
      };
    });
  }

  async setFlag(
    key: string,
    enabled: boolean,
    updatedBy?: string,
    rolloutPercent?: number | null,
    allowUserIds?: string[]
  ): Promise<FeatureFlagDto> {
    const updated = await prisma.featureFlag.upsert({
      where: { key },
      update: {
        enabled,
        updatedBy,
        ...(rolloutPercent !== undefined ? { rolloutPercent } : {}),
        ...(allowUserIds !== undefined ? { allowUserIds } : {}),
      },
      create: {
        key,
        name: FEATURE_FLAGS.find((f) => f.key === key)?.name || key,
        description: FEATURE_FLAGS.find((f) => f.key === key)?.description || '',
        enabled,
        updatedBy,
        rolloutPercent: rolloutPercent ?? null,
        allowUserIds: allowUserIds || [],
      },
    });

    await this.cache.del(`${this.CACHE_PREFIX}${key}`);

    return {
      key: updated.key,
      name: updated.name,
      description: updated.description,
      enabled: updated.enabled,
      updatedBy: updated.updatedBy,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Seeds missing default feature flags into MongoDB.
   */
  async seedInitialFlags(): Promise<void> {
    for (const def of FEATURE_FLAGS) {
      await prisma.featureFlag.upsert({
        where: { key: def.key },
        update: {},
        create: {
          key: def.key,
          name: def.name,
          description: def.description,
          enabled: def.defaultValue,
        },
      });
    }
  }
}
