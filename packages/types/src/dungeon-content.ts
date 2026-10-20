import { z } from 'zod';

export const createDungeonFloorRuleSchema = z.object({
  dungeonType: z.enum(['INFINITY_TOWER', 'VOID_RIFT']),
  floorNumber: z.coerce.number().int().min(1, 'Floor must be >= 1').max(1000, 'Max floor is 1000'),
  difficulty: z.enum(['NORMAL', 'HARD', 'NIGHTMARE', 'ABYSS']).nullable().optional(),
  title: z.string().trim().max(100).nullable().optional(),
  enemyPool: z.any().refine((val) => val !== undefined && val !== null, 'Enemy pool is required'),
  scalingFactor: z.coerce.number().min(0.1).max(50.0).default(1.0).optional(),
  rewardCoins: z.coerce.number().int().min(0).max(100_000_000).default(0).optional(),
  rewardInfinityCoins: z.coerce.number().int().min(0).max(100_000_000).default(0).optional(),
  rewardXp: z.coerce.number().int().min(0).max(100_000_000).default(0).optional(),
  rewardItems: z.any().nullable().optional(),
  ruleModifiers: z.any().nullable().optional(),
  isBossFloor: z.boolean().default(false).optional(),
  enabled: z.boolean().default(true).optional(),
  sortOrder: z.coerce.number().int().default(0).optional(),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const updateDungeonFloorRuleSchema = z.object({
  title: z.string().trim().max(100).nullable().optional(),
  enemyPool: z.any().optional(),
  scalingFactor: z.coerce.number().min(0.1).max(50.0).optional(),
  rewardCoins: z.coerce.number().int().min(0).max(100_000_000).optional(),
  rewardInfinityCoins: z.coerce.number().int().min(0).max(100_000_000).optional(),
  rewardXp: z.coerce.number().int().min(0).max(100_000_000).optional(),
  rewardItems: z.any().nullable().optional(),
  ruleModifiers: z.any().nullable().optional(),
  isBossFloor: z.boolean().optional(),
  enabled: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const archiveDungeonFloorRuleSchema = z.object({
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const bulkUpdateTowerFloorsSchema = z.object({
  dungeonType: z.enum(['INFINITY_TOWER', 'VOID_RIFT']).default('INFINITY_TOWER'),
  fromFloor: z.coerce.number().int().min(1, 'From floor must be >= 1').max(1000, 'Max floor is 1000'),
  toFloor: z.coerce.number().int().min(1, 'To floor must be >= 1').max(1000, 'Max floor is 1000'),
  patch: z.object({
    scalingFactor: z.coerce.number().min(0.1).max(50.0).optional(),
    rewardCoins: z.coerce.number().int().min(0).max(100_000_000).optional(),
    rewardInfinityCoins: z.coerce.number().int().min(0).max(100_000_000).optional(),
    rewardXp: z.coerce.number().int().min(0).max(100_000_000).optional(),
    isBossFloor: z.boolean().optional(),
    enabled: z.boolean().optional(),
    levelOffset: z.coerce.number().int().min(-1000).max(5000).optional(),
  }),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const copyTowerFloorSchema = z.object({
  dungeonType: z.enum(['INFINITY_TOWER', 'VOID_RIFT']).default('INFINITY_TOWER'),
  sourceFloor: z.coerce.number().int().min(1, 'Source floor must be >= 1').max(1000, 'Max floor is 1000'),
  fromFloor: z.coerce.number().int().min(1, 'From floor must be >= 1').max(1000, 'Max floor is 1000'),
  toFloor: z.coerce.number().int().min(1, 'To floor must be >= 1').max(1000, 'Max floor is 1000'),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export const resetTowerFloorSchema = z.object({
  dungeonType: z.enum(['INFINITY_TOWER', 'VOID_RIFT']).default('INFINITY_TOWER'),
  fromFloor: z.coerce.number().int().min(1, 'From floor must be >= 1').max(1000, 'Max floor is 1000'),
  toFloor: z.coerce.number().int().min(1, 'To floor must be >= 1').max(1000, 'Max floor is 1000'),
  reason: z.string().trim().min(5, 'Audit reason must be at least 5 characters'),
});

export interface DungeonFloorRuleDto {
  id: string;
  dungeonType: 'INFINITY_TOWER' | 'VOID_RIFT';
  floorNumber: number;
  difficulty?: 'NORMAL' | 'HARD' | 'NIGHTMARE' | 'ABYSS' | null;
  title?: string | null;
  enemyPool: any;
  scalingFactor: number;
  rewardCoins: number;
  rewardInfinityCoins: number;
  rewardXp: number;
  rewardItems?: any;
  ruleModifiers?: any;
  isBossFloor: boolean;
  enabled: boolean;
  isArchived: boolean;
  sortOrder: number;
  dataVersion?: number;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateDungeonFloorRuleInput = z.infer<typeof createDungeonFloorRuleSchema>;
export type UpdateDungeonFloorRuleInput = z.infer<typeof updateDungeonFloorRuleSchema>;
export type ArchiveDungeonFloorRuleInput = z.infer<typeof archiveDungeonFloorRuleSchema>;
export type BulkUpdateTowerFloorsInput = z.infer<typeof bulkUpdateTowerFloorsSchema>;
export type CopyTowerFloorInput = z.infer<typeof copyTowerFloorSchema>;
export type ResetTowerFloorInput = z.infer<typeof resetTowerFloorSchema>;
