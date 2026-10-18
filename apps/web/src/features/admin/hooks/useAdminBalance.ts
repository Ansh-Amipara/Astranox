import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import type { BalanceSection } from '@astranox/constants';
import type {
  BalanceSectionOverviewDto,
  BalancePreviewResultDto,
  BalanceConfigHistoryItemDto,
  BalanceDraftInput,
  BalancePublishInput,
  BalanceRollbackInput,
  BalanceResetInput,
} from '@astranox/types';

export const adminBalanceKeys = {
  all: ['admin', 'balance'] as const,
  sections: () => [...adminBalanceKeys.all, 'sections'] as const,
  section: (section: string) => [...adminBalanceKeys.all, 'section', section] as const,
  history: (section: string) => [...adminBalanceKeys.all, 'history', section] as const,
};

export interface BalanceSectionDetailResponse {
  defaults: Record<string, any>;
  active: Record<string, any>;
  draft: Record<string, any> | null;
  version: number;
}

export function useAdminBalanceSections() {
  return useQuery<BalanceSectionOverviewDto[]>({
    queryKey: adminBalanceKeys.sections(),
    queryFn: async () => {
      const { data } = await api.get('/admin/balance');
      return data.data;
    },
  });
}

export function useAdminBalanceSectionDetail(section: BalanceSection) {
  return useQuery<BalanceSectionDetailResponse>({
    queryKey: adminBalanceKeys.section(section),
    queryFn: async () => {
      const { data } = await api.get(`/admin/balance/${section}`);
      return data.data;
    },
    enabled: Boolean(section),
  });
}

export function useAdminBalanceHistory(section: BalanceSection) {
  return useQuery<BalanceConfigHistoryItemDto[]>({
    queryKey: adminBalanceKeys.history(section),
    queryFn: async () => {
      const { data } = await api.get(`/admin/balance/${section}/history`);
      return data.data;
    },
    enabled: Boolean(section),
  });
}

export function useSaveBalanceDraft(section: BalanceSection) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BalanceDraftInput) => {
      const res = await api.post(`/admin/balance/${section}/draft`, input);
      return res.data.data;
    },
    onSuccess: () => {
      notify.success('Draft saved successfully');
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.section(section) });
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.sections() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to save draft';
      notify.error(message, { id: 'admin-save-draft-error' });
    },
  });
}

export function usePreviewBalanceDiff(section: BalanceSection) {
  return useMutation<BalancePreviewResultDto, any, BalanceDraftInput>({
    mutationFn: async (input: BalanceDraftInput) => {
      const res = await api.post(`/admin/balance/${section}/preview`, input);
      return res.data.data as BalancePreviewResultDto;
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to generate balance diff';
      notify.error(message, { id: 'admin-preview-diff-error' });
    },
  });
}

export function usePublishBalance(section: BalanceSection) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BalancePublishInput) => {
      const res = await api.post(`/admin/balance/${section}/publish`, input, {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      notify.success(`Published ${section} balance v${data.version} live!`);
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.section(section) });
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.sections() });
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.history(section) });
      queryClient.invalidateQueries({ queryKey: ['config', 'balance'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to publish balance';
      notify.error(message, { id: 'admin-publish-balance-error' });
    },
  });
}

export function useRollbackBalance(section: BalanceSection) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BalanceRollbackInput) => {
      const res = await api.post(`/admin/balance/${section}/rollback`, input, {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      notify.success(`Rolled back ${section} balance to v${data.version}!`);
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.section(section) });
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.sections() });
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.history(section) });
      queryClient.invalidateQueries({ queryKey: ['config', 'balance'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to rollback balance';
      notify.error(message, { id: 'admin-rollback-balance-error' });
    },
  });
}

export function useResetBalance(section: BalanceSection) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BalanceResetInput) => {
      const res = await api.post(`/admin/balance/${section}/reset`, input, {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      });
      return res.data.data;
    },
    onSuccess: () => {
      notify.success(`Reset ${section} balance to canonical defaults`);
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.section(section) });
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.sections() });
      queryClient.invalidateQueries({ queryKey: adminBalanceKeys.history(section) });
      queryClient.invalidateQueries({ queryKey: ['config', 'balance'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to reset balance';
      notify.error(message, { id: 'admin-reset-balance-error' });
    },
  });
}
