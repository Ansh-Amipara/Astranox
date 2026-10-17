import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import {
  ShopItemDto,
  ShopPriceHistoryDto,
  UpdateShopItemInput,
  BulkPriceUpdateInput,
  BulkPriceResultDto,
  ResetShopItemInput,
} from '@astranox/types';

export const adminShopKeys = {
  all: ['admin', 'shop'] as const,
  items: (filters?: Record<string, unknown>) => [...adminShopKeys.all, 'items', filters] as const,
  history: (key: string) => [...adminShopKeys.all, 'history', key] as const,
};

export function useAdminShopItems(filters?: { category?: string; search?: string; enabled?: 'true' | 'false' }) {
  return useQuery<ShopItemDto[]>({
    queryKey: adminShopKeys.items(filters),
    queryFn: async () => {
      const { data } = await api.get('/admin/shop/items', { params: filters });
      return data.data;
    },
  });
}

export function useShopPriceHistory(key: string, enabled: boolean = true) {
  return useQuery<ShopPriceHistoryDto[]>({
    queryKey: adminShopKeys.history(key),
    queryFn: async () => {
      const { data } = await api.get(`/admin/shop/items/${key}/history`);
      return data.data;
    },
    enabled: Boolean(key) && enabled,
  });
}

export function useUpdateShopItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: UpdateShopItemInput }) => {
      const res = await api.patch(`/admin/shop/items/${key}`, data);
      return res.data.data as ShopItemDto;
    },
    onSuccess: (updatedItem) => {
      notify.success(`Updated item "${updatedItem.name}" successfully`);
      queryClient.invalidateQueries({ queryKey: adminShopKeys.all });
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update shop item';
      notify.error(message, { id: 'admin-update-shop-error' });
    },
  });
}

export function useBulkPriceUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkPriceUpdateInput) => {
      const res = await api.post('/admin/shop/items/bulk-price', data);
      return res.data.data as BulkPriceResultDto;
    },
    onSuccess: (result) => {
      if (!result.dryRun) {
        notify.success(`Bulk updated ${result.updatedCount} items successfully`);
        queryClient.invalidateQueries({ queryKey: adminShopKeys.all });
        queryClient.invalidateQueries({ queryKey: ['shopItems'] });
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to execute bulk price update';
      notify.error(message, { id: 'admin-bulk-price-error' });
    },
  });
}

export function useResetShopItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: ResetShopItemInput }) => {
      const res = await api.post(`/admin/shop/items/${key}/reset`, data);
      return res.data.data as ShopItemDto;
    },
    onSuccess: (resetItem) => {
      notify.success(`Reset "${resetItem.name}" to default prices`);
      queryClient.invalidateQueries({ queryKey: adminShopKeys.all });
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to reset item';
      notify.error(message, { id: 'admin-reset-shop-error' });
    },
  });
}
