import { z } from 'zod';
import { entityIdSchema, paginationQuerySchema } from './common';

export const adminReasonSchema = z.object({
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
});

export const addMoneySchema = z.object({
  amount: z.coerce.number().int().positive('Amount must be positive'),
  currencyType: z.enum(['astralCoins', 'infinityCoins']).default('astralCoins'),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters').default('Admin manual adjustment'),
});

export const adminGrantCurrencySchema = z.object({
  amount: z.coerce.number().int().refine((val) => val !== 0, 'Amount cannot be zero'),
  currencyType: z.enum(['astralCoins', 'infinityCoins']),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
});

export const adminGrantItemSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required'),
  quantity: z.coerce.number().int().refine((val) => val !== 0, 'Quantity cannot be zero'),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
});

export const banUserSchema = z.object({
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const unbanUserSchema = z.object({
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
});

export const addPokemonSchema = z.object({
  speciesId: z.coerce.number().int().positive('Species ID must be positive'),
  level: z.coerce.number().int().min(1, 'Level must be at least 1').max(5000, 'Level cannot exceed 5000'),
  potential: z.string().trim().min(1, 'Potential is required'),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters').default('Admin manual grant'),
  ivs: z
    .object({
      ivHp: z.number().int().min(0).max(31).optional(),
      ivAttack: z.number().int().min(0).max(31).optional(),
      ivDefense: z.number().int().min(0).max(31).optional(),
      ivSpAtk: z.number().int().min(0).max(31).optional(),
      ivSpDef: z.number().int().min(0).max(31).optional(),
      ivSpeed: z.number().int().min(0).max(31).optional(),
    })
    .optional(),
});

export const editPokemonSchema = z.object({
  potential: z.string().optional(),
  addXp: z.coerce.number().int().positive().optional(),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters').default('Admin manual edit'),
  ivs: z
    .object({
      ivHp: z.number().int().min(0).max(31).optional(),
      ivAttack: z.number().int().min(0).max(31).optional(),
      ivDefense: z.number().int().min(0).max(31).optional(),
      ivSpAtk: z.number().int().min(0).max(31).optional(),
      ivSpDef: z.number().int().min(0).max(31).optional(),
      ivSpeed: z.number().int().min(0).max(31).optional(),
    })
    .optional(),
});

export const updateFeatureFlagSchema = z.object({
  key: z.string().min(1, 'Flag key is required'),
  enabled: z.boolean(),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
});

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  message: z.string().trim().min(1, 'Message is required').max(1000),
  type: z.enum(['info', 'warning', 'danger', 'success']).default('info'),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const auditLogQuerySchema = paginationQuerySchema.extend({
  adminId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const adminUserIdParamSchema = z.object({
  id: entityIdSchema,
});

export const adminPokemonParamSchema = z.object({
  id: entityIdSchema,
  pokemonId: entityIdSchema,
});

export type AddMoneyInput = z.infer<typeof addMoneySchema>;
export type AdminGrantCurrencyInput = z.infer<typeof adminGrantCurrencySchema>;
export type AdminGrantItemInput = z.infer<typeof adminGrantItemSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type UnbanUserInput = z.infer<typeof unbanUserSchema>;
export type AddPokemonInput = z.infer<typeof addPokemonSchema>;
export type EditPokemonInput = z.infer<typeof editPokemonSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;

// --- Admin DTOs ---

export interface AdminStatsDto {
  activePlayers24h: number;
  newRegistrations24h: number;
  battles24h: number;
  currencyInCirculation: {
    astralCoins: number;
    infinityCoins: number;
  };
  topPurchasedItems: {
    itemKey: string;
    name: string;
    totalPurchased: number;
    totalVolume: number;
  }[];
  recentActions: AuditLogDto[];
}

export interface AuditLogDto {
  id: string;
  adminId: string;
  adminUsername?: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  reason?: string | null;
  requestId?: string | null;
  beforeValues?: any;
  afterValues?: any;
  ipAddress?: string | null;
  createdAt: string;
}

export interface FeatureFlagDto {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface AnnouncementDto {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  active: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt?: string | null;
}

export interface EconomyReportDto {
  summary: {
    totalAstralCoins: number;
    totalInfinityCoins: number;
    netAstralChange24h: number;
    netInfinityChange24h: number;
  };
  sources: { source: string; amount: number; currency: string }[];
  sinks: { sink: string; amount: number; currency: string }[];
}

export interface AdminUserListItemDto {
  id: string;
  username: string;
  email: string;
  role: string;
  isBanned: boolean;
  banReason?: string | null;
  bannedAt?: string | null;
  createdAt: string;
  astralCoins?: number;
  infinityCoins?: number;
}

export interface AdminUserDetailDto {
  id: string;
  username: string;
  email: string;
  role: string;
  isBanned: boolean;
  banReason?: string | null;
  bannedAt?: string | null;
  createdAt: string;
  trainerSave?: {
    id: string;
    astralCoins: number;
    infinityCoins: number;
    currentMapId: string;
    party: any[];
    inventory: Array<{ itemId: string; quantity: number }>;
  } | null;
  recentAuditLogs: AuditLogDto[];
}

