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

  async isEnabled(flagKey: string): Promise<boolean> {
    const cacheKey = `${this.CACHE_PREFIX}${flagKey}`;
    const cached = await this.cache.get<boolean>(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const flag = await prisma.featureFlag.findUnique({
      where: { key: flagKey },
    });

    if (flag) {
      await this.cache.set(cacheKey, flag.enabled, this.CACHE_TTL_SECONDS);
      return flag.enabled;
    }

    // Fallback to default in constants
    const defaultDef = FEATURE_FLAGS.find((f) => f.key === flagKey);
    const fallback = defaultDef ? defaultDef.defaultValue : true;
    await this.cache.set(cacheKey, fallback, this.CACHE_TTL_SECONDS);
    return fallback;
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

  async setFlag(key: string, enabled: boolean, updatedBy?: string): Promise<FeatureFlagDto> {
    const updated = await prisma.featureFlag.upsert({
      where: { key },
      update: {
        enabled,
        updatedBy,
      },
      create: {
        key,
        name: FEATURE_FLAGS.find((f) => f.key === key)?.name || key,
        description: FEATURE_FLAGS.find((f) => f.key === key)?.description || '',
        enabled,
        updatedBy,
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
}
