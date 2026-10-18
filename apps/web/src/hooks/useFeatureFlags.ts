import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FeatureFlagDto } from '@astranox/types';

export const useFeatureFlags = () => {
  return useQuery<FeatureFlagDto[]>({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      const { data } = await api.get('/flags');
      return data.data;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
};

/**
 * Returns whether a specific feature flag is currently enabled.
 * Defaults to true if flags are still loading (except maintenanceMode which defaults to false).
 */
export const useFlag = (key: string): boolean => {
  const { data: flags } = useFeatureFlags();

  if (!flags) {
    return key === 'maintenanceMode' ? false : true;
  }

  const found = flags.find((f) => f.key === key);
  return found ? found.enabled : (key === 'maintenanceMode' ? false : true);
};
