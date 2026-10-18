import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import type {
  ArenaTrainerDto,
  CreateArenaTrainerInput,
  UpdateArenaTrainerInput,
  ArchiveArenaTrainerInput,
  RankDefinitionDto,
  UpdateRankDefinitionInput,
} from '@astranox/types';

export const adminArenaKeys = {
  all: ['admin', 'arena'] as const,
  trainers: (filters?: Record<string, unknown>) => [...adminArenaKeys.all, 'trainers', filters] as const,
  ranks: () => [...adminArenaKeys.all, 'ranks'] as const,
};

export function useAdminArenaTrainers(filters?: {
  targetRank?: string;
  search?: string;
  isArchived?: 'true' | 'false' | 'all';
  enabled?: 'true' | 'false';
}) {
  return useQuery<ArenaTrainerDto[]>({
    queryKey: adminArenaKeys.trainers(filters),
    queryFn: async () => {
      const { data } = await api.get('/admin/arena/trainers', { params: filters });
      return data.data;
    },
  });
}

export function useCreateArenaTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateArenaTrainerInput) => {
      const res = await api.post('/admin/arena/trainers', data, {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      });
      return res.data.data as ArenaTrainerDto;
    },
    onSuccess: (created) => {
      notify.success(`Created Arena Trainer "${created.name}"!`);
      queryClient.invalidateQueries({ queryKey: adminArenaKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create arena trainer';
      notify.error(message, { id: 'admin-create-trainer-error' });
    },
  });
}

export function useUpdateArenaTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: UpdateArenaTrainerInput }) => {
      const res = await api.patch(`/admin/arena/trainers/${key}`, data);
      return res.data.data as ArenaTrainerDto;
    },
    onSuccess: (updated) => {
      notify.success(`Updated trainer "${updated.name}"`);
      queryClient.invalidateQueries({ queryKey: adminArenaKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update arena trainer';
      notify.error(message, { id: 'admin-update-trainer-error' });
    },
  });
}

export function useArchiveArenaTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: ArchiveArenaTrainerInput }) => {
      const res = await api.delete(`/admin/arena/trainers/${key}`, { data });
      return res.data.data as ArenaTrainerDto;
    },
    onSuccess: (archived) => {
      notify.success(`Archived trainer "${archived.name}"`);
      queryClient.invalidateQueries({ queryKey: adminArenaKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to archive arena trainer';
      notify.error(message, { id: 'admin-archive-trainer-error' });
    },
  });
}

export function useUnarchiveArenaTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: ArchiveArenaTrainerInput }) => {
      const res = await api.post(`/admin/arena/trainers/${key}/restore`, data);
      return res.data.data as ArenaTrainerDto;
    },
    onSuccess: (restored) => {
      notify.success(`Restored trainer "${restored.name}"`);
      queryClient.invalidateQueries({ queryKey: adminArenaKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to restore arena trainer';
      notify.error(message, { id: 'admin-restore-trainer-error' });
    },
  });
}

export function useAdminRanks() {
  return useQuery<RankDefinitionDto[]>({
    queryKey: adminArenaKeys.ranks(),
    queryFn: async () => {
      const { data } = await api.get('/admin/arena/ranks');
      return data.data;
    },
  });
}

export function useUpdateRankDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rank, data }: { rank: string; data: UpdateRankDefinitionInput }) => {
      const res = await api.patch(`/admin/arena/ranks/${rank}`, data);
      return res.data.data as RankDefinitionDto;
    },
    onSuccess: (updated) => {
      notify.success(`Updated Rank "${updated.name}"`);
      queryClient.invalidateQueries({ queryKey: adminArenaKeys.ranks() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update rank definition';
      notify.error(message, { id: 'admin-update-rank-error' });
    },
  });
}
