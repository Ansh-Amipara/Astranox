import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import { FeatureFlagDto, UpdateFeatureFlagInput } from '@astranox/types';

export const adminFlagKeys = {
  all: ['admin', 'flags'] as const,
};

export function useAdminFlags() {
  return useQuery<FeatureFlagDto[]>({
    queryKey: adminFlagKeys.all,
    queryFn: async () => {
      const { data } = await api.get('/admin/flags');
      return data.data;
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: UpdateFeatureFlagInput }) => {
      const res = await api.patch(`/admin/flags/${key}`, data);
      return res.data.data as FeatureFlagDto;
    },
    onSuccess: (updatedFlag) => {
      notify.success(`Flag "${updatedFlag.name}" ${updatedFlag.enabled ? 'enabled' : 'disabled'}`);
      queryClient.invalidateQueries({ queryKey: adminFlagKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update feature flag';
      notify.error(message, { id: 'admin-update-flag-error' });
    },
  });
}
