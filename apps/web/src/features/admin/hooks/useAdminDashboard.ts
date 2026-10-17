import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AdminStatsDto, EconomyReportDto } from '@astranox/types';

export const adminDashboardKeys = {
  stats: ['admin', 'dashboard', 'stats'] as const,
  economy: ['admin', 'dashboard', 'economy'] as const,
};

export function useAdminStats() {
  return useQuery<AdminStatsDto>({
    queryKey: adminDashboardKeys.stats,
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/stats');
      return data.data;
    },
    refetchInterval: 30_000,
  });
}

export function useAdminEconomy() {
  return useQuery<EconomyReportDto>({
    queryKey: adminDashboardKeys.economy,
    queryFn: async () => {
      const { data } = await api.get('/admin/economy');
      return data.data;
    },
  });
}
