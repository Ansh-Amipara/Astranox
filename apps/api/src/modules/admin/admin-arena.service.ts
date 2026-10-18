import { injectable } from 'tsyringe';
import { prisma } from '../../core/db/prisma';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { CacheService } from '../../core/services/cache.service';
import { ARENA_TRAINERS } from '../../game/constants/arena-trainers';
import { RANK_EXAMINERS } from '../battles/services/battle-session.service';
import type {
  ArenaTrainerDto,
  CreateArenaTrainerInput,
  UpdateArenaTrainerInput,
  RankDefinitionDto,
  UpdateRankDefinitionInput,
} from '@astranox/types';

const CANONICAL_RANK_ORDER = [
  'F',
  'E',
  'D',
  'C',
  'B',
  'A',
  'S_MINUS',
  'S',
  'S_PLUS',
  'SS_MINUS',
  'SS',
  'SS_PLUS',
  'SSS_MINUS',
  'SSS',
  'SSS_PLUS',
  'EX',
];

const CANONICAL_LEVEL_BOUNDS: Record<string, { min: number; max: number }> = {
  F: { min: 1, max: 25 },
  E: { min: 26, max: 50 },
  D: { min: 51, max: 75 },
  C: { min: 76, max: 100 },
  B: { min: 101, max: 150 },
  A: { min: 151, max: 200 },
  S_MINUS: { min: 201, max: 300 },
  S: { min: 301, max: 350 },
  S_PLUS: { min: 351, max: 400 },
  SS_MINUS: { min: 401, max: 500 },
  SS: { min: 501, max: 600 },
  SS_PLUS: { min: 601, max: 700 },
  SSS_MINUS: { min: 701, max: 800 },
  SSS: { min: 801, max: 900 },
  SSS_PLUS: { min: 901, max: 1000 },
  EX: { min: 1001, max: 5000 },
};

@injectable()
export class AdminArenaService {
  constructor(private cache: CacheService) {}

  private mapTrainerToDto(trainer: any): ArenaTrainerDto {
    return {
      id: trainer.id,
      key: trainer.key,
      name: trainer.name,
      targetRank: trainer.targetRank,
      level: trainer.level,
      team: trainer.team,
      coins: trainer.coins,
      xp: trainer.xp,
      theme: trainer.theme,
      ratingDelta: trainer.ratingDelta ?? 25,
      cooldownMinutes: trainer.cooldownMinutes ?? 0,
      enabled: trainer.enabled,
      isArchived: trainer.isArchived ?? false,
      sortOrder: trainer.sortOrder ?? 0,
      dataVersion: trainer.dataVersion,
      updatedBy: trainer.updatedBy,
      createdAt: trainer.createdAt.toISOString(),
      updatedAt: trainer.updatedAt.toISOString(),
    };
  }

  private mapRankToDto(rankDef: any): RankDefinitionDto {
    return {
      id: rankDef.id,
      rank: rankDef.rank,
      name: rankDef.name,
      minLevel: rankDef.minLevel,
      maxLevel: rankDef.maxLevel,
      requiredWins: rankDef.requiredWins ?? 0,
      examinerName: rankDef.examinerName,
      examinerLevel: rankDef.examinerLevel,
      examinerAce: rankDef.examinerAce,
      examinerTeam: rankDef.examinerTeam,
      rewardCoins: rankDef.rewardCoins,
      rewardXp: rankDef.rewardXp,
      rewardItems: rankDef.rewardItems || [],
      enabled: rankDef.enabled,
      sortOrder: rankDef.sortOrder ?? 0,
      dataVersion: rankDef.dataVersion,
      updatedBy: rankDef.updatedBy,
      createdAt: rankDef.createdAt.toISOString(),
      updatedAt: rankDef.updatedAt.toISOString(),
    };
  }

  // --- Seed default trainers if none exist in database ---
  async ensureSeedTrainers(): Promise<void> {
    const count = await prisma.arenaTrainer.count();
    if (count > 0) return;

    for (let i = 0; i < ARENA_TRAINERS.length; i++) {
      const def = ARENA_TRAINERS[i];
      await prisma.arenaTrainer.upsert({
        where: { key: def.id },
        create: {
          key: def.id,
          name: def.name,
          targetRank: def.targetRank,
          level: def.level,
          team: def.team,
          coins: def.coins,
          xp: def.xp,
          theme: def.theme,
          ratingDelta: 25,
          cooldownMinutes: 0,
          enabled: true,
          isArchived: false,
          sortOrder: i + 1,
        },
        update: {},
      });
    }
  }

  // --- Seed default rank definitions if none exist ---
  async ensureSeedRanks(): Promise<void> {
    const count = await prisma.rankDefinition.count();
    if (count > 0) return;

    for (let i = 0; i < CANONICAL_RANK_ORDER.length; i++) {
      const rankKey = CANONICAL_RANK_ORDER[i];
      const examiner = RANK_EXAMINERS[rankKey] || {
        name: `${rankKey} Rank Examiner`,
        level: CANONICAL_LEVEL_BOUNDS[rankKey]?.min || 50,
        ace: 'pikachu',
        team: ['pikachu'],
        coins: 1000 * (i + 1),
        xp: 2000 * (i + 1),
        items: [],
      };
      const bounds = CANONICAL_LEVEL_BOUNDS[rankKey] || { min: 1, max: 100 };

      await prisma.rankDefinition.upsert({
        where: { rank: rankKey as any },
        create: {
          rank: rankKey as any,
          name: `Rank ${rankKey.replace('_MINUS', '-').replace('_PLUS', '+')}`,
          minLevel: bounds.min,
          maxLevel: bounds.max,
          requiredWins: i * 3,
          examinerName: examiner.name,
          examinerLevel: examiner.level,
          examinerAce: examiner.ace,
          examinerTeam: examiner.team,
          rewardCoins: examiner.coins,
          rewardXp: examiner.xp,
          rewardItems: examiner.items || [],
          enabled: true,
          sortOrder: i + 1,
        },
        update: {},
      });
    }
  }

  // --- Arena Trainer Queries & Mutations ---

  async getArenaTrainers(query?: {
    targetRank?: string;
    search?: string;
    isArchived?: string;
    enabled?: string;
  }): Promise<ArenaTrainerDto[]> {
    await this.ensureSeedTrainers();

    const where: any = {};
    if (query?.targetRank && query.targetRank !== 'all') {
      where.targetRank = query.targetRank;
    }
    if (query?.enabled !== undefined) {
      where.enabled = query.enabled === 'true';
    }
    if (query?.isArchived === 'true') {
      where.isArchived = true;
    } else if (query?.isArchived === 'all') {
      // return both
    } else {
      where.isArchived = false;
    }

    if (query?.search && query.search.trim().length > 0) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { key: { contains: query.search.trim(), mode: 'insensitive' } },
        { theme: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const trainers = await prisma.arenaTrainer.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { level: 'asc' }],
    });

    return trainers.map((t) => this.mapTrainerToDto(t));
  }

  async createArenaTrainer(
    adminId: string,
    input: CreateArenaTrainerInput,
    requestId?: string
  ): Promise<ArenaTrainerDto> {
    const existing = await prisma.arenaTrainer.findUnique({
      where: { key: input.key },
    });

    if (existing) {
      throw new BadRequestError(`Arena trainer with key '${input.key}' already exists.`);
    }

    const [created] = await prisma.$transaction([
      prisma.arenaTrainer.create({
        data: {
          key: input.key,
          name: input.name,
          targetRank: input.targetRank,
          level: input.level,
          team: input.team,
          coins: input.coins,
          xp: input.xp,
          theme: input.theme,
          ratingDelta: input.ratingDelta,
          cooldownMinutes: input.cooldownMinutes,
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
          action: 'ARENA_TRAINER_CREATE',
          entityType: 'ARENA_TRAINER',
          entityId: input.key,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues: null,
          afterValues: input,
        },
      }),
    ]);

    await this.cache.del('arena:trainers:all');
    return this.mapTrainerToDto(created);
  }

  async updateArenaTrainer(
    adminId: string,
    key: string,
    input: UpdateArenaTrainerInput,
    requestId?: string
  ): Promise<ArenaTrainerDto> {
    const existing = await prisma.arenaTrainer.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new NotFoundError(`Arena trainer with key '${key}' not found.`);
    }

    const beforeValues = {
      name: existing.name,
      targetRank: existing.targetRank,
      level: existing.level,
      team: existing.team,
      coins: existing.coins,
      xp: existing.xp,
      theme: existing.theme,
      ratingDelta: existing.ratingDelta,
      cooldownMinutes: existing.cooldownMinutes,
      enabled: existing.enabled,
      isArchived: existing.isArchived,
      sortOrder: existing.sortOrder,
    };

    const updateData: any = {
      dataVersion: { increment: 1 },
      updatedBy: adminId,
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.targetRank !== undefined) updateData.targetRank = input.targetRank;
    if (input.level !== undefined) updateData.level = input.level;
    if (input.team !== undefined) updateData.team = input.team;
    if (input.coins !== undefined) updateData.coins = input.coins;
    if (input.xp !== undefined) updateData.xp = input.xp;
    if (input.theme !== undefined) updateData.theme = input.theme;
    if (input.ratingDelta !== undefined) updateData.ratingDelta = input.ratingDelta;
    if (input.cooldownMinutes !== undefined) updateData.cooldownMinutes = input.cooldownMinutes;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.isArchived !== undefined) updateData.isArchived = input.isArchived;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

    const [updated] = await prisma.$transaction([
      prisma.arenaTrainer.update({
        where: { key },
        data: updateData,
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'ARENA_TRAINER_UPDATE',
          entityType: 'ARENA_TRAINER',
          entityId: key,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues,
          afterValues: updateData,
        },
      }),
    ]);

    await this.cache.del('arena:trainers:all');
    return this.mapTrainerToDto(updated);
  }

  async archiveArenaTrainer(
    adminId: string,
    key: string,
    reason: string,
    requestId?: string
  ): Promise<ArenaTrainerDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to archive an Arena Trainer.');
    }

    const existing = await prisma.arenaTrainer.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new NotFoundError(`Arena trainer with key '${key}' not found.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.arenaTrainer.update({
        where: { key },
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
          action: 'ARENA_TRAINER_ARCHIVE',
          entityType: 'ARENA_TRAINER',
          entityId: key,
          reason,
          requestId: requestId || null,
          beforeValues: { isArchived: existing.isArchived, enabled: existing.enabled },
          afterValues: { isArchived: true, enabled: false },
        },
      }),
    ]);

    await this.cache.del('arena:trainers:all');
    return this.mapTrainerToDto(updated);
  }

  async unarchiveArenaTrainer(
    adminId: string,
    key: string,
    reason: string,
    requestId?: string
  ): Promise<ArenaTrainerDto> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A reason of at least 5 characters is required to restore an Arena Trainer.');
    }

    const existing = await prisma.arenaTrainer.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new NotFoundError(`Arena trainer with key '${key}' not found.`);
    }

    const [updated] = await prisma.$transaction([
      prisma.arenaTrainer.update({
        where: { key },
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
          action: 'ARENA_TRAINER_RESTORE',
          entityType: 'ARENA_TRAINER',
          entityId: key,
          reason,
          requestId: requestId || null,
          beforeValues: { isArchived: existing.isArchived, enabled: existing.enabled },
          afterValues: { isArchived: false, enabled: true },
        },
      }),
    ]);

    await this.cache.del('arena:trainers:all');
    return this.mapTrainerToDto(updated);
  }

  // --- Rank Definitions Queries & Mutations ---

  async getRankDefinitions(): Promise<RankDefinitionDto[]> {
    await this.ensureSeedRanks();

    const ranks = await prisma.rankDefinition.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return ranks.map((r) => this.mapRankToDto(r));
  }

  async updateRankDefinition(
    adminId: string,
    rank: string,
    input: UpdateRankDefinitionInput,
    requestId?: string
  ): Promise<RankDefinitionDto> {
    const existing = await prisma.rankDefinition.findUnique({
      where: { rank: rank as any },
    });

    if (!existing) {
      throw new NotFoundError(`Rank definition '${rank}' not found.`);
    }

    const beforeValues = {
      name: existing.name,
      minLevel: existing.minLevel,
      maxLevel: existing.maxLevel,
      requiredWins: existing.requiredWins,
      examinerName: existing.examinerName,
      examinerLevel: existing.examinerLevel,
      examinerAce: existing.examinerAce,
      examinerTeam: existing.examinerTeam,
      rewardCoins: existing.rewardCoins,
      rewardXp: existing.rewardXp,
      rewardItems: existing.rewardItems,
      enabled: existing.enabled,
    };

    const updateData: any = {
      dataVersion: { increment: 1 },
      updatedBy: adminId,
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.minLevel !== undefined) updateData.minLevel = input.minLevel;
    if (input.maxLevel !== undefined) updateData.maxLevel = input.maxLevel;
    if (input.requiredWins !== undefined) updateData.requiredWins = input.requiredWins;
    if (input.examinerName !== undefined) updateData.examinerName = input.examinerName;
    if (input.examinerLevel !== undefined) updateData.examinerLevel = input.examinerLevel;
    if (input.examinerAce !== undefined) updateData.examinerAce = input.examinerAce;
    if (input.examinerTeam !== undefined) updateData.examinerTeam = input.examinerTeam;
    if (input.rewardCoins !== undefined) updateData.rewardCoins = input.rewardCoins;
    if (input.rewardXp !== undefined) updateData.rewardXp = input.rewardXp;
    if (input.rewardItems !== undefined) updateData.rewardItems = input.rewardItems;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

    const [updated] = await prisma.$transaction([
      prisma.rankDefinition.update({
        where: { rank: rank as any },
        data: updateData,
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: 'RANK_DEFINITION_UPDATE',
          entityType: 'RANK_DEFINITION',
          entityId: rank,
          reason: input.reason,
          requestId: requestId || null,
          beforeValues,
          afterValues: updateData,
        },
      }),
    ]);

    await this.cache.del('rank:definitions:all');
    return this.mapRankToDto(updated);
  }
}
