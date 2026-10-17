import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import {
  AdminUserListItemDto,
  AdminUserDetailDto,
  BanUserInput,
  UnbanUserInput,
  AdminGrantCurrencyInput,
  AdminGrantItemInput,
} from '@astranox/types';

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...adminUserKeys.lists(), params] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
};

export function useAdminUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<{
    users: AdminUserListItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: adminUserKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params });
      return data.data;
    },
  });
}

export function useAdminUserDetail(id: string, enabled: boolean = true) {
  return useQuery<AdminUserDetailDto>({
    queryKey: adminUserKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${id}`);
      return data.data;
    },
    enabled: Boolean(id) && enabled,
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BanUserInput }) => {
      const res = await api.post(`/admin/users/${id}/ban`, data);
      return res.data.data;
    },
    onSuccess: (_, { id }) => {
      notify.success('User has been banned');
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to ban user';
      notify.error(message, { id: 'admin-ban-user-error' });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UnbanUserInput }) => {
      const res = await api.post(`/admin/users/${id}/unban`, data);
      return res.data.data;
    },
    onSuccess: (_, { id }) => {
      notify.success('User has been unbanned');
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to unban user';
      notify.error(message, { id: 'admin-unban-user-error' });
    },
  });
}

export function useGrantCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AdminGrantCurrencyInput }) => {
      const idempotencyKey = crypto.randomUUID();
      const res = await api.post(`/admin/users/${id}/currency`, data, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      return res.data.data;
    },
    onSuccess: (_, { id }) => {
      notify.success('Currency granted successfully');
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to grant currency';
      notify.error(message, { id: 'admin-grant-currency-error' });
    },
  });
}

export function useGrantItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AdminGrantItemInput }) => {
      const idempotencyKey = crypto.randomUUID();
      const res = await api.post(`/admin/users/${id}/items`, data, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      return res.data.data;
    },
    onSuccess: (_, { id }) => {
      notify.success('Item granted successfully');
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to grant item';
      notify.error(message, { id: 'admin-grant-item-error' });
    },
  });
}
