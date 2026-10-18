import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { CacheService } from '../../core/services/cache.service';
import type {
  DungeonFloorRuleDto,
  CreateDungeonFloorRuleInput,
  UpdateDungeonFloorRuleInput,
} from '@astranox/types';

@injectable()
export class AdminDungeonService {
  constructor(private cache: CacheService) {}

  private mapFloorToDto(floor: any): DungeonFloorRuleDto {
    return {
      id: floor.id,
      dungeonType: floor.dungeonType,
      floorNumber: floor.floorNumber,
      difficulty: floor.difficulty || null,
      title: floor.title || null,
      enemyPool: floor.enemyPool,
      scalingFactor: floor.scalingFactor ?? 1.0,
      rewardCoins: floor.rewardCoins ?? 0,
      rewardInfinityCoins: floor.rewardInfinityCoins ?? 0,
      rewardItems: floor.rewardItems || null,
      ruleModifiers: floor.ruleModifiers || null,
      isBossFloor: floor.isBossFloor ?? false,
      enabled: floor.enabled,
      isArchived: floor.isArchived ?? false,
      sortOrder: floor.sortOrder ?? 0,
      dataVersion: floor.dataVersion,
      updatedBy: floor.updatedBy,
      createdAt: floor.createdAt.toISOString(),
      updatedAt: floor.updatedAt.toISOString(),
    };
  }

  async getFloorRules(query: {
    dungeonType?: 'INFINITY_TOWER' | 'VOID_RIFT';
    difficulty?: 'NORMAL' | 'HARD' | 'NIGHTMARE' | 'ABYSS';
    isArchived?: string;
  }): Promise<DungeonFloorRuleDto[]> {
    const where: any = {};
    if (query.dungeonType) where.dungeonType = query.dungeonType;
    if (query.difficulty) where.difficulty = query.difficulty;

    if (query.isArchived === 'true') {
      where.isArchived = true;
    } else if (query.isArchived === 'all') {
      // both
    } else {
      where.isArchived = false;
    }

    const rules = await prisma.dungeonFloorRule.findMany({
      where,
      orderBy: [{ floorNumber: 'asc' }],
    });

    return rules.map((r) => this.mapFloorToDto(r));
  }

  async createFloorRule(
    adminId: string,
    input: CreateDungeonFloorRuleInput,
    requestId?: string
  ): Promise<DungeonFloorRuleDto> {
    const existing = await prisma.dungeonFloorRule.findFirst({
      where: {
        dungeonType: input.dungeonType,
        floorNumber: input.floorNumber,
        difficulty: input.difficulty || null,
      },
    });

    if (existing) {
      throw new BadRequestError(
        `Floor rule for ${input.dungeonType} floor ${input.floorNumber} ${
          input.difficulty ? `(${input.difficulty})` : ''
        } already exists.`
      );
    }

    const [created] = await prisma.$transaction([
      prisma.dungeonFloorRule.create({
        data: {
          dungeonType: input.dungeonType,
          floorNumber: input.floorNumber,
          difficulty: input.difficulty || null,
          title: input.title || null,
          enemyPool: input.enemyPool,
          scalingFactor: input.scalingFactor ?? 1.0,
          rewardCoins: input.rewardCoins ?? 0,
          rewardInfinityCoins: input.rewardInfinityCoins ?? 0,
          rewardItems: input.rewardItems || null,
          ruleModifiers: input.ruleModifiers || null,
          isBossFloor: input.isBossFloor ?? false,
          enabled: input.enabled ?? true,
          isArchived: false,
          sortOrder: input.sortOrder ?? 0,
          updatedBy: adminId,
          dataVersion: 1,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'DUNGEON_FLOOR_CREATE',
          entityType: 'DUNGEON_FLOOR_RULE',
          entityId: `${input.dungeonType}:${input.floorNumber}`,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues: null,
          afterValues: input,
        },
      }),
    ]);

    await this.cache.del(`dungeon:${input.dungeonType}:floors`);
    return this.mapFloorToDto(created);
  }

  async updateFloorRule(
    adminId: string,
    id: string,
    input: UpdateDungeonFloorRuleInput,
    requestId?: string
  ): Promise<DungeonFloorRuleDto> {
    const existing = await prisma.dungeonFloorRule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Dungeon floor rule '${id}' not found.`);
    }

    const beforeValues = {
      title: existing.title,
      enemyPool: existing.enemyPool,
      scalingFactor: existing.scalingFactor,
      rewardCoins: existing.rewardCoins,
      rewardInfinityCoins: existing.rewardInfinityCoins,
      rewardItems: existing.rewardItems,
      ruleModifiers: existing.ruleModifiers,
      isBossFloor: existing.isBossFloor,
      enabled: existing.enabled,
      isArchived: existing.isArchived,
      sortOrder: existing.sortOrder,
    };

    const updateData: any = {
      dataVersion: { increment: 1 },
      updatedBy: adminId,
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.enemyPool !== undefined) updateData.enemyPool = input.enemyPool;
    if (input.scalingFactor !== undefined) updateData.scalingFactor = input.scalingFactor;
    if (input.rewardCoins !== undefined) updateData.rewardCoins = input.rewardCoins;
    if (input.rewardInfinityCoins !== undefined) updateData.rewardInfinityCoins = input.rewardInfinityCoins;
    if (input.rewardItems !== undefined) updateData.rewardItems = input.rewardItems;
    if (input.ruleModifiers !== undefined) updateData.ruleModifiers = input.ruleModifiers;
    if (input.isBossFloor !== undefined) updateData.isBossFloor = input.isBossFloor;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.isArchived !== undefined) updateData.isArchived = input.isArchived;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

    const [updated] = await prisma.$transaction([
      prisma.dungeonFloorRule.update({
        where: { id },
        data: updateData,
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'DUNGEON_FLOOR_UPDATE',
          entityType: 'DUNGEON_FLOOR_RULE',
          entityId: id,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues,
          afterValues: updateData,
        },
      }),
    ]);

    await this.cache.del(`dungeon:${existing.dungeonType}:floors`);
    return this.mapFloorToDto(updated);
  }

  async archiveFloorRule(
    adminId: string,
    id: string,
    reason: string,
    requestId?: string
  ): Promise<DungeonFloorRuleDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to archive a floor rule.');
    }

    const existing = await prisma.dungeonFloorRule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Dungeon floor rule '${id}' not found.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.dungeonFloorRule.update({
        where: { id },
        data: {
          isArchived: true,
          enabled: false,
          updatedBy: adminId,
          dataVersion: { increment: 1 },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'DUNGEON_FLOOR_ARCHIVE',
          entityType: 'DUNGEON_FLOOR_RULE',
          entityId: id,
          reason,
          requestId: requestId || null,
          beforeValues: { isArchived: existing.isArchived, enabled: existing.enabled },
          afterValues: { isArchived: true, enabled: false },
        },
      }),
    ]);

    await this.cache.del(`dungeon:${existing.dungeonType}:floors`);
    return this.mapFloorToDto(updated);
  }

  async unarchiveFloorRule(
    adminId: string,
    id: string,
    reason: string,
    requestId?: string
  ): Promise<DungeonFloorRuleDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to restore a floor rule.');
    }

    const existing = await prisma.dungeonFloorRule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Dungeon floor rule '${id}' not found.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.dungeonFloorRule.update({
        where: { id },
        data: {
          isArchived: false,
          enabled: true,
          updatedBy: adminId,
          dataVersion: { increment: 1 },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'DUNGEON_FLOOR_RESTORE',
          entityType: 'DUNGEON_FLOOR_RULE',
          entityId: id,
          reason,
          requestId: requestId || null,
          beforeValues: { isArchived: existing.isArchived, enabled: existing.enabled },
          afterValues: { isArchived: false, enabled: true },
        },
      }),
    ]);

    await this.cache.del(`dungeon:${existing.dungeonType}:floors`);
    return this.mapFloorToDto(updated);
  }
}
