import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { CacheService } from '../../core/services/cache.service';
import { logger } from '../../config/logger';
import { AppError, NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { deepMerge } from '@astranox/utils';
import {
  BALANCE_SECTIONS,
  BALANCE_SCHEMAS,
  BALANCE_DEFAULTS,
  BalanceSection,
} from '@astranox/constants';
import type {
  BalanceSectionOverviewDto,
  BalancePreviewResultDto,
  BalanceSectionDiffItem,
  BalanceConfigHistoryItemDto,
} from '@astranox/types';

@injectable()
export class BalanceService {
  private memoryCache = new Map<string, { value: any; version: number }>();
  private isSubscribed = false;

  constructor(private cache: CacheService) {
    this.initPubSub();
  }

  private initPubSub() {
    if (this.isSubscribed) return;
    this.isSubscribed = true;
    if (!this.cache || typeof this.cache.getClient !== 'function') return;
    const redisClient = this.cache.getClient();
    if (!redisClient || typeof redisClient.duplicate !== 'function') return;
    if (redisClient.status !== 'ready') return;

    try {
      // Duplicate client for subscribing to avoid blocking normal commands
      const subClient = redisClient.duplicate();
      subClient.subscribe('balance:invalidated', (err) => {
        if (err) {
          logger.warn('Failed to subscribe to balance:invalidated channel: ' + err.message);
        } else {
          logger.info('Subscribed to balance:invalidated Pub/Sub channel');
        }
      });

      subClient.on('message', (_channel, message) => {
        try {
          const payload = JSON.parse(message);
          if (payload?.section) {
            this.memoryCache.delete(payload.section);
            logger.info(`Invalidated memory cache for balance section: ${payload.section}`);
          }
        } catch {
          this.memoryCache.clear();
        }
      });
    } catch (e: any) {
      logger.warn('Redis pub/sub initialization bypassed: ' + e.message);
    }
  }

  /**
   * Retrieves the effective balance config for a domain section.
   * Merges section defaults with active database overrides.
   * Falls back to defaults if overrides are invalid or missing.
   * Can snapshot a specific version if snapshotVersion is passed.
   */
  async get<T = any>(section: BalanceSection, snapshotVersion?: number | null): Promise<T> {
    const defaults = BALANCE_DEFAULTS[section];
    if (!defaults) {
      throw new AppError(`Unknown balance section: ${section}`, 500);
    }

    // 1. Version snapshot check (historical reproducibility for battles/runs)
    if (snapshotVersion !== undefined && snapshotVersion !== null) {
      try {
        const snap = await prisma.balanceConfig.findUnique({
          where: {
            section_version: {
              section,
              version: snapshotVersion,
            },
          },
        });
        if (snap && snap.values) {
          const merged = deepMerge(defaults, snap.values as Record<string, any>);
          const parsed = BALANCE_SCHEMAS[section].safeParse(merged);
          if (parsed.success) return parsed.data as T;
        }
      } catch (err: any) {
        logger.error(`Failed to load balance snapshot v${snapshotVersion} for ${section}: ${err.message}`);
      }
      return defaults as T;
    }

    // 2. In-memory hot cache
    const mem = this.memoryCache.get(section);
    if (mem) {
      return mem.value as T;
    }

    // 3. Redis distributed cache
    const cacheKey = `balance:effective:${section}`;
    const cached = await this.cache.get<T>(cacheKey);
    if (cached) {
      this.memoryCache.set(section, { value: cached, version: 1 });
      return cached;
    }

    // 4. Database active override lookup
    try {
      const activeRecord = await prisma.balanceConfig.findFirst({
        where: { section, status: 'active' },
        orderBy: { version: 'desc' },
      });

      const overrides = activeRecord && activeRecord.values ? (activeRecord.values as Record<string, any>) : {};
      const merged = deepMerge(defaults, overrides);

      // 5. Schema validation
      const parseResult = BALANCE_SCHEMAS[section].safeParse(merged);
      if (parseResult.success) {
        const effective = parseResult.data as T;
        // Cache in Redis for 1 hour & memory cache
        await this.cache.set(cacheKey, effective, 3600);
        this.memoryCache.set(section, {
          value: effective,
          version: activeRecord?.version || 1,
        });
        return effective;
      } else {
        logger.error(
          { section, error: parseResult.error.format() },
          'Active balance override failed schema validation! Falling back to defaults.'
        );
        return defaults as T;
      }
    } catch (dbErr: any) {
      logger.error(`Database error fetching balance override for ${section}: ${dbErr.message}`);
      return defaults as T;
    }
  }

  /**
   * Returns overview of all balance sections.
   */
  async getAllSectionsOverview(): Promise<BalanceSectionOverviewDto[]> {
    const list: BalanceSectionOverviewDto[] = [];
    for (const section of BALANCE_SECTIONS) {
      list.push(await this.getSectionOverview(section));
    }
    return list;
  }

  /**
   * Returns details for a single balance section.
   */
  async getSectionOverview(section: BalanceSection): Promise<BalanceSectionOverviewDto> {
    const defaults = BALANCE_DEFAULTS[section] || {};
    const [active, draft] = await Promise.all([
      prisma.balanceConfig.findFirst({
        where: { section, status: 'active' },
        orderBy: { version: 'desc' },
      }),
      prisma.balanceConfig.findFirst({
        where: { section, status: 'draft' },
        orderBy: { version: 'desc' },
      }),
    ]);

    const activeOverrides = (active?.values as Record<string, any>) || {};
    const effectiveValues = deepMerge(defaults, activeOverrides);

    return {
      section,
      version: active?.version || 0,
      status: active ? 'active' : 'draft',
      defaults,
      activeOverrides,
      effectiveValues,
      draftValues: draft ? (draft.values as Record<string, any>) : null,
      publishedAt: active?.publishedAt ? active.publishedAt.toISOString() : null,
      publishedBy: active?.publishedBy || null,
    };
  }

  /**
   * Saves or updates a draft for a balance section.
   */
  async saveDraft(
    adminId: string,
    section: BalanceSection,
    values: Record<string, any>
  ): Promise<BalanceSectionOverviewDto> {
    const schema = BALANCE_SCHEMAS[section];
    if (!schema) {
      throw new BadRequestError(`Invalid balance section: ${section}`);
    }

    const defaults = BALANCE_DEFAULTS[section] || {};
    const testMerged = deepMerge(defaults, values);
    const parseResult = schema.safeParse(testMerged);
    if (!parseResult.success) {
      throw new BadRequestError(
        `Draft values violate balance schema: ${parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }

    // Check for existing draft
    const existingDraft = await prisma.balanceConfig.findFirst({
      where: { section, status: 'draft' },
      orderBy: { version: 'desc' },
    });

    if (existingDraft) {
      const mergedDraftValues = {
        ...(existingDraft.values as Record<string, any>),
        ...values,
      };
      await prisma.balanceConfig.update({
        where: { id: existingDraft.id },
        data: {
          values: mergedDraftValues,
          createdBy: adminId,
          updatedAt: new Date(),
        },
      });
    } else {
      const highestVersionRecord = await prisma.balanceConfig.findFirst({
        where: { section },
        orderBy: { version: 'desc' },
      });
      const nextVersion = (highestVersionRecord?.version || 0) + 1;

      await prisma.balanceConfig.create({
        data: {
          section,
          version: nextVersion,
          values,
          status: 'draft',
          createdBy: adminId,
        },
      });
    }

    return this.getSectionOverview(section);
  }

  /**
   * Generates a preview diff between currently active balance and the draft.
   */
  async previewDraft(section: BalanceSection): Promise<BalancePreviewResultDto> {
    const defaults = BALANCE_DEFAULTS[section] || {};
    const [active, draft] = await Promise.all([
      prisma.balanceConfig.findFirst({
        where: { section, status: 'active' },
        orderBy: { version: 'desc' },
      }),
      prisma.balanceConfig.findFirst({
        where: { section, status: 'draft' },
        orderBy: { version: 'desc' },
      }),
    ]);

    if (!draft || !draft.values) {
      return {
        section,
        hasChanges: false,
        hasExtremeChanges: false,
        warnings: ['No draft found for this section.'],
        diffs: [],
      };
    }

    const activeOverrides = (active?.values as Record<string, any>) || {};
    const currentEffective = deepMerge(defaults, activeOverrides);
    const draftValues = draft.values as Record<string, any>;
    const newEffective = deepMerge(defaults, draftValues);

    const diffs: BalanceSectionDiffItem[] = [];
    const warnings: string[] = [];
    let hasExtremeChanges = false;

    // Check all keys in new effective vs current effective
    const allKeys = Array.from(new Set([...Object.keys(currentEffective), ...Object.keys(newEffective)]));

    for (const key of allKeys) {
      const defaultVal = defaults[key];
      const currentVal = currentEffective[key];
      const newVal = newEffective[key];

      const hasFieldChanged = JSON.stringify(currentVal) !== JSON.stringify(newVal);
      if (!hasFieldChanged) continue;

      let percentChange: number | undefined;
      let isExtreme = false;

      if (typeof currentVal === 'number' && typeof newVal === 'number') {
        if (currentVal !== 0) {
          percentChange = ((newVal - currentVal) / Math.abs(currentVal)) * 100;
        } else if (newVal !== 0) {
          percentChange = 100;
        }

        // Flag changes > 50% shift
        if (percentChange !== undefined && Math.abs(percentChange) > 50) {
          isExtreme = true;
          hasExtremeChanges = true;
          warnings.push(
            `Extreme change on '${key}': shifting from ${currentVal} to ${newVal} (${percentChange.toFixed(1)}%).`
          );
        }
      }

      diffs.push({
        field: key,
        defaultValue: defaultVal,
        currentActiveValue: currentVal,
        draftValue: newVal,
        percentChange,
        isExtreme,
      });
    }

    return {
      section,
      hasChanges: diffs.length > 0,
      hasExtremeChanges,
      warnings,
      diffs,
    };
  }

  /**
   * Publishes the current draft to active status.
   */
  async publishDraft(
    adminId: string,
    section: BalanceSection,
    reason: string,
    confirmExtreme: boolean = false,
    requestId?: string
  ): Promise<BalanceSectionOverviewDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to publish balance changes.');
    }

    const preview = await this.previewDraft(section);
    if (!preview.hasChanges) {
      throw new BadRequestError('No changes detected in draft to publish.');
    }

    if (preview.hasExtremeChanges && !confirmExtreme) {
      throw new BadRequestError(
        'Extreme balance change detected (>50% shift). Please pass confirmExtreme: true to proceed.'
      );
    }

    const draft = await prisma.balanceConfig.findFirst({
      where: { section, status: 'draft' },
      orderBy: { version: 'desc' },
    });

    if (!draft) {
      throw new NotFoundError(`No draft found to publish for section: ${section}`);
    }

    const active = await prisma.balanceConfig.findFirst({
      where: { section, status: 'active' },
      orderBy: { version: 'desc' },
    });

    const now = new Date();

    // Atomic transaction
    await prisma.$transaction([
      ...(active
        ? [
            prisma.balanceConfig.update({
              where: { id: active.id },
              data: { status: 'archived' },
            }),
          ]
        : []),
      prisma.balanceConfig.update({
        where: { id: draft.id },
        data: {
          status: 'active',
          publishedBy: adminId,
          publishedAt: now,
          reason,
          dataVersion: { increment: 1 },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'BALANCE_PUBLISH',
          entityType: 'BALANCE_CONFIG',
          entityId: `${section}:v${draft.version}`,
          reason,
          requestId: requestId || null,
          beforeValues: active?.values || {},
          afterValues: draft.values || {},
        },
      }),
    ]);

    // Invalidate local cache and Redis
    await this.invalidateCache(section, draft.version);

    return this.getSectionOverview(section);
  }

  /**
   * Rolls back a balance section to a previous version.
   */
  async rollback(
    adminId: string,
    section: BalanceSection,
    targetVersion: number,
    reason: string,
    requestId?: string
  ): Promise<BalanceSectionOverviewDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required for rollback.');
    }

    const targetRecord = await prisma.balanceConfig.findUnique({
      where: {
        section_version: {
          section,
          version: targetVersion,
        },
      },
    });

    if (!targetRecord) {
      throw new NotFoundError(`Balance configuration for section '${section}' version ${targetVersion} not found.`);
    }

    const active = await prisma.balanceConfig.findFirst({
      where: { section, status: 'active' },
      orderBy: { version: 'desc' },
    });

    const highestVersionRecord = await prisma.balanceConfig.findFirst({
      where: { section },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (highestVersionRecord?.version || 0) + 1;
    const now = new Date();

    await prisma.$transaction([
      ...(active
        ? [
            prisma.balanceConfig.update({
              where: { id: active.id },
              data: { status: 'archived' },
            }),
          ]
        : []),
      prisma.balanceConfig.create({
        data: {
          section,
          version: nextVersion,
          values: targetRecord.values || {},
          status: 'active',
          createdBy: adminId,
          publishedBy: adminId,
          publishedAt: now,
          reason: `Rollback to v${targetVersion}: ${reason}`,
          dataVersion: 1,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'BALANCE_ROLLBACK',
          entityType: 'BALANCE_CONFIG',
          entityId: `${section}:v${nextVersion}`,
          reason: `Rollback to v${targetVersion}: ${reason}`,
          requestId: requestId || null,
          beforeValues: active?.values || {},
          afterValues: targetRecord.values || {},
        },
      }),
    ]);

    await this.invalidateCache(section, nextVersion);

    return this.getSectionOverview(section);
  }

  /**
   * Resets a section's balance back to code defaults by archiving active overrides.
   */
  async resetToDefaults(
    adminId: string,
    section: BalanceSection,
    reason: string,
    requestId?: string
  ): Promise<BalanceSectionOverviewDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required for reset.');
    }

    const active = await prisma.balanceConfig.findFirst({
      where: { section, status: 'active' },
      orderBy: { version: 'desc' },
    });

    if (active) {
      await prisma.$transaction([
        prisma.balanceConfig.update({
          where: { id: active.id },
          data: { status: 'archived' },
        }),
        prisma.auditLog.create({
          data: {
            adminId,
            action: 'BALANCE_RESET',
            entityType: 'BALANCE_CONFIG',
            entityId: section,
            reason,
            requestId: requestId || null,
            beforeValues: active.values || {},
            afterValues: {},
          },
        }),
      ]);
    }

    await this.invalidateCache(section, 0);

    return this.getSectionOverview(section);
  }

  /**
   * Retrieves version history for a balance section.
   */
  async getHistory(section: BalanceSection): Promise<BalanceConfigHistoryItemDto[]> {
    const records = await prisma.balanceConfig.findMany({
      where: { section },
      orderBy: { version: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      section: r.section,
      version: r.version,
      status: r.status,
      values: (r.values as Record<string, any>) || {},
      reason: r.reason,
      createdBy: r.createdBy,
      publishedBy: r.publishedBy,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  /**
   * Invalidates local cache, Redis cache, and broadcasts to other instances via Pub/Sub.
   */
  private async invalidateCache(section: BalanceSection, version: number) {
    this.memoryCache.delete(section);
    await this.cache.del(`balance:effective:${section}`);
    await this.cache.del('balance:public:effective');

    const client = this.cache.getClient();
    if (client) {
      try {
        await client.publish(
          'balance:invalidated',
          JSON.stringify({ section, version, timestamp: Date.now() })
        );
      } catch (err: any) {
        logger.warn('Failed to publish balance:invalidated Pub/Sub event: ' + err.message);
      }
    }
  }
}
