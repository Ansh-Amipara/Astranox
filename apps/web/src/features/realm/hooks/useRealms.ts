import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealmService } from '../api';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';

export function useRealms() {
  return useQuery({
    queryKey: ['realms'],
    queryFn: RealmService.listRealms,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
}

export function useRealmDetail(realmId: string | undefined) {
  return useQuery({
    queryKey: ['realm', realmId],
    queryFn: () => {
      if (!realmId) throw new Error('Realm ID is required');
      return RealmService.getRealmDetail(realmId);
    },
    enabled: Boolean(realmId),
    staleTime: 60 * 1000 * 5,
  });
}

export function useRealmSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (realmId: string) => RealmService.searchRealm(realmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeBattle'] });
      queryClient.invalidateQueries({ queryKey: ['battleSession'] });
    },
    onError: (err: unknown) => {
      const parsed = parseApiError(err);
      notify.error(parsed.message || 'Failed to search Realm', { id: 'realm-search-error' });
    },
  });
}
