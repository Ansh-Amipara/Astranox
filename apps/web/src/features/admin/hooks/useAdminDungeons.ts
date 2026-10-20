import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import type {
  DungeonFloorRuleDto,
  CreateDungeonFloorRuleInput,
  UpdateDungeonFloorRuleInput,
  ArchiveDungeonFloorRuleInput,
  BulkUpdateTowerFloorsInput,
  CopyTowerFloorInput,
  ResetTowerFloorInput,
} from '@astranox/types';

export const adminDungeonKeys = {
  all: ['admin', 'dungeons'] as const,
  floors: (filters?: Record<string, unknown>) => [...adminDungeonKeys.all, 'floors', filters] as const,
};

export function useAdminDungeonFloors(filters?: {
  dungeonType?: 'INFINITY_TOWER' | 'VOID_RIFT';
  difficulty?: 'NORMAL' | 'HARD' | 'NIGHTMARE' | 'ABYSS';
  isArchived?: 'true' | 'false' | 'all';
}) {
  return useQuery<DungeonFloorRuleDto[]>({
    queryKey: adminDungeonKeys.floors(filters),
    queryFn: async () => {
      const { data } = await api.get('/admin/dungeons/floors', { params: filters });
      return data.data;
    },
  });
}

export function useCreateDungeonFloor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDungeonFloorRuleInput) => {
      const res = await api.post('/admin/dungeons/floors', data, {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      });
      return res.data.data as DungeonFloorRuleDto;
    },
    onSuccess: (created) => {
      notify.success(`Created rule for ${created.dungeonType} Floor ${created.floorNumber}!`);
      queryClient.invalidateQueries({ queryKey: adminDungeonKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create dungeon floor rule';
      notify.error(message, { id: 'admin-create-floor-error' });
    },
  });
}

export function useUpdateDungeonFloor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDungeonFloorRuleInput }) => {
      const res = await api.patch(`/admin/dungeons/floors/${id}`, data);
      return res.data.data as DungeonFloorRuleDto;
    },
    onSuccess: (updated) => {
      notify.success(`Updated ${updated.dungeonType} Floor ${updated.floorNumber}`);
      queryClient.invalidateQueries({ queryKey: adminDungeonKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update dungeon floor rule';
      notify.error(message, { id: 'admin-update-floor-error' });
    },
  });
}

export function useArchiveDungeonFloor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ArchiveDungeonFloorRuleInput }) => {
      const res = await api.delete(`/admin/dungeons/floors/${id}`, { data });
      return res.data.data as DungeonFloorRuleDto;
    },
    onSuccess: (archived) => {
      notify.success(`Archived ${archived.dungeonType} Floor ${archived.floorNumber}`);
      queryClient.invalidateQueries({ queryKey: adminDungeonKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to archive dungeon floor rule';
      notify.error(message, { id: 'admin-archive-floor-error' });
    },
  });
}

export function useUnarchiveDungeonFloor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ArchiveDungeonFloorRuleInput }) => {
      const res = await api.post(`/admin/dungeons/floors/${id}/restore`, data);
      return res.data.data as DungeonFloorRuleDto;
    },
    onSuccess: (restored) => {
      notify.success(`Restored ${restored.dungeonType} Floor ${restored.floorNumber}`);
      queryClient.invalidateQueries({ queryKey: adminDungeonKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to restore dungeon floor rule';
      notify.error(message, { id: 'admin-restore-floor-error' });
    },
  });
}

export function useBulkUpdateDungeonFloors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkUpdateTowerFloorsInput) => {
      const res = await api.post('/admin/dungeons/floors/bulk-update', data);
      return res.data.data as { updatedCount: number };
    },
    onSuccess: (result) => {
      notify.success(`Successfully updated ${result.updatedCount} floors!`);
      queryClient.invalidateQueries({ queryKey: adminDungeonKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to bulk update floors';
      notify.error(message, { id: 'admin-bulk-update-error' });
    },
  });
}

export function useCopyDungeonFloor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CopyTowerFloorInput) => {
      const res = await api.post('/admin/dungeons/floors/copy', data);
      return res.data.data as { updatedCount: number };
    },
    onSuccess: (result) => {
      notify.success(`Successfully copied floor to ${result.updatedCount} floors!`);
      queryClient.invalidateQueries({ queryKey: adminDungeonKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to copy floor';
      notify.error(message, { id: 'admin-copy-floor-error' });
    },
  });
}

export function useResetDungeonFloors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ResetTowerFloorInput) => {
      const res = await api.post('/admin/dungeons/floors/reset', data);
      return res.data.data as { resetCount: number };
    },
    onSuccess: (result) => {
      notify.success(`Successfully reset ${result.resetCount} floors to procedural defaults!`);
      queryClient.invalidateQueries({ queryKey: adminDungeonKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to reset floors';
      notify.error(message, { id: 'admin-reset-floor-error' });
    },
  });
}

