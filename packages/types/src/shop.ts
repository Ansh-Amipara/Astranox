import { z } from 'zod';
import { entityIdSchema } from './common';

// --- Legacy / Compatibility ---
export const buyItemSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

export const buyMoveSchema = z.object({
  moveId: z.coerce.number().int().positive('Move ID must be a positive integer'),
});

export const buyBulkSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string().trim().min(1, 'Item ID is required'),
        quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
});

export const useItemSchema = z.object({
  itemId: z.string().trim().min(1, 'Item ID is required'),
  targetPokemonId: entityIdSchema.optional(),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1').default(1),
});

export type BuyItemInput = z.infer<typeof buyItemSchema>;
export type BuyMoveInput = z.infer<typeof buyMoveSchema>;
export type BuyBulkInput = z.infer<typeof buyBulkSchema>;
export type UseItemInput = z.infer<typeof useItemSchema>;

// --- Modern Dynamic Pokémart Schemas ---

export const shopItemQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  enabled: z.enum(['true', 'false']).optional(),
});

export const updateShopItemSchema = z
  .object({
    price: z.coerce.number().int().min(0, 'Price cannot be negative').max(100_000_000, 'Price exceeds max limit').optional(),
    salePrice: z.coerce.number().int().min(0, 'Sale price cannot be negative').max(100_000_000, 'Sale price exceeds max limit').nullable().optional(),
    saleStartsAt: z.string().nullable().optional(),
    saleEndsAt: z.string().nullable().optional(),
    enabled: z.boolean().optional(),
    minLevel: z.coerce.number().int().min(1, 'Min level must be >= 1').max(100, 'Max level is 100').nullable().optional(),
    dailyLimitPerUser: z.coerce.number().int().min(0, 'Limit cannot be negative').max(9999, 'Max limit is 9999').nullable().optional(),
    totalStock: z.coerce.number().int().min(0, 'Total stock cannot be negative').max(1_000_000).nullable().optional(),
    stockRemaining: z.coerce.number().int().min(0, 'Stock remaining cannot be negative').max(1_000_000).nullable().optional(),
    reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
    confirmExtreme: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.salePrice != null && data.price != null && data.salePrice >= data.price) {
        return false;
      }
      return true;
    },
    {
      message: 'Sale price must be strictly lower than regular price',
      path: ['salePrice'],
    }
  )
  .refine(
    (data) => {
      if (data.saleStartsAt && data.saleEndsAt) {
        return new Date(data.saleEndsAt).getTime() > new Date(data.saleStartsAt).getTime();
      }
      return true;
    },
    {
      message: 'Sale end date must be after sale start date',
      path: ['saleEndsAt'],
    }
  );

export const bulkPriceUpdateSchema = z.object({
  itemKeys: z.array(z.string().min(1)).min(1, 'Select at least one item'),
  mode: z.enum(['set', 'percent_inc', 'percent_dec']),
  value: z.coerce.number().int().min(0, 'Value must be positive'),
  dryRun: z.boolean().default(false),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
  confirmExtreme: z.boolean().optional(),
});

export const resetShopItemSchema = z.object({
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
});

export const purchaseShopItemSchema = z.object({
  itemKey: z.string().trim().min(1, 'Item key is required'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1').max(999, 'Max 999 items per purchase'),
  expectedPrice: z.coerce.number().int().min(0).optional(),
});

export type ShopItemQueryInput = z.infer<typeof shopItemQuerySchema>;
export type UpdateShopItemInput = z.infer<typeof updateShopItemSchema>;
export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>;
export type ResetShopItemInput = z.infer<typeof resetShopItemSchema>;
export type PurchaseShopItemInput = z.infer<typeof purchaseShopItemSchema>;

// --- Modern Shop DTOs ---

export interface ShopItemDto {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  currency: 'astralCoins' | 'infinityCoins';
  price: number;
  salePrice: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  effectivePrice: number;
  isOnSale: boolean;
  enabled: boolean;
  minLevel: number | null;
  dailyLimitPerUser: number | null;
  userDailyPurchased?: number;
  remainingDailyLimit?: number | null;
  totalStock: number | null;
  stockRemaining: number | null;
  sortOrder: number;
  spriteUrl: string | null;
  dataVersion: number;
  updatedBy?: string | null;
  updatedAt: string;
}

export interface ShopPriceHistoryDto {
  id: string;
  itemKey: string;
  oldPrice: number;
  newPrice: number;
  oldSalePrice: number | null;
  newSalePrice: number | null;
  changedBy: string;
  changerUsername?: string;
  reason: string;
  requestId?: string | null;
  createdAt: string;
}

export interface BulkPricePreviewItem {
  key: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  percentChange: number;
  isExtremeChange: boolean;
}

export interface BulkPriceResultDto {
  dryRun: boolean;
  items: BulkPricePreviewItem[];
  updatedCount: number;
}
