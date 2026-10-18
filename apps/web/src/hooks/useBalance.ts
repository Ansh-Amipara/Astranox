import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  BALANCE_DEFAULTS,
  type BalanceSection,
  type ProgressionBalanceConfig,
  type ExplorationBalanceConfig,
  type EconomyBalanceConfig,
  type LimitsBalanceConfig,
} from '@astranox/constants';

export interface PublicBalanceConfigMap {
  progression?: ProgressionBalanceConfig;
  exploration?: ExplorationBalanceConfig;
  economy?: EconomyBalanceConfig;
  limits?: LimitsBalanceConfig;
  arena?: any;
  rank?: any;
  tower?: any;
  rift?: any;
  [key: string]: any;
}

export const useBalance = () => {
  return useQuery<PublicBalanceConfigMap>({
    queryKey: ['config', 'balance'],
    queryFn: async () => {
      const { data } = await api.get('/config/balance');
      return data.data;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
};

export function useBalanceSection<T = any>(section: BalanceSection): T {
  const { data } = useBalance();
  if (data && data[section]) {
    return data[section] as T;
  }
  return BALANCE_DEFAULTS[section] as T;
}

export function useProgressionBalance(): ProgressionBalanceConfig {
  return useBalanceSection<ProgressionBalanceConfig>('progression');
}
