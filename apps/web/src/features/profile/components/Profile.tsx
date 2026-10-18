import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { updateProfileSchema } from '@astranox/types';
import { api } from '@/shared/api/api';
import { useAuthStore } from '@/features/auth/store';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';

const formatRank = (rank: string) => {
  if (!rank) return 'Unranked';
  return rank.replace('_MINUS', '-').replace('_PLUS', '+');
};

import { Skeleton, ErrorState } from '@/components/ui';

export function Profile() {
  const { user, setAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (username: string) => {
      const parsed = updateProfileSchema.safeParse({ username });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || 'Invalid username');
      }
      const { data } = await api.post('/auth/update-profile', { username: parsed.data.username });
      return data;
    },
    onSuccess: (res) => {
      if (res.success && res.data) {
        setAuth(res.data.accessToken, res.data.user);
        setIsEditing(false);
        setUsernameError(null);
        notify.success('Username updated successfully');
      }
    },
    onError: (err: unknown) => {
      const parsed = parseApiError(err);
      const msg = parsed.fields?.username || parsed.message || (err as Error)?.message || 'Failed to update username';
      setUsernameError(msg);
      notify.error(msg);
    }
  });

  const { data: trainerSave, isLoading, isError, refetch } = useQuery({
    queryKey: ['trainer-me'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
    enabled: !!user,
  });

  const playerCp = trainerSave?.party?.reduce((sum: number, p: { cp?: number }) => sum + (p.cp || 0), 0) || 0;

  if (!user) return null;

  if (isError) {
    return (
      <div className="w-full min-h-[calc(100dvh-4rem)] p-4 sm:p-6 flex items-center justify-center bg-surface-raised">
        <ErrorState
          title="Failed to Load Profile"
          message="Could not retrieve your trainer save data from the server."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[calc(100dvh-4rem)] p-4 md:p-8 flex flex-col bg-surface-raised">
      <div className="bg-primary rounded-xl shadow-md overflow-hidden border border-border flex-grow flex flex-col">
        <div className="p-4 md:p-8 flex-grow">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Player Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 h-full">
            <div className="bg-surface-raised p-4 sm:p-6 rounded-lg border border-border h-full">
              <h2 className="text-lg sm:text-xl font-semibold text-subtle mb-4 border-b pb-2">Character</h2>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-subtle font-medium text-sm sm:text-base">Username:</span>
                  {isEditing ? (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => {
                            setNewUsername(e.target.value);
                            setUsernameError(null);
                          }}
                          className="px-3 py-2 border border-border rounded-md text-base sm:text-sm outline-none focus:border-border focus:ring-1 focus:ring-border bg-surface text-foreground min-h-[44px] flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => updateProfileMutation.mutate(newUsername)}
                          disabled={updateProfileMutation.isPending || !newUsername || newUsername === user.username}
                          className="min-h-[44px] px-3 py-2 text-sm bg-surface-raised text-foreground rounded-md hover:bg-surface-raised disabled:opacity-50 font-medium transition-colors border border-border flex items-center justify-center"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setNewUsername(user.username);
                            setUsernameError(null);
                          }}
                          disabled={updateProfileMutation.isPending}
                          className="min-h-[44px] px-3 py-2 text-sm bg-surface-raised text-subtle rounded-md hover:bg-surface-raised font-medium transition-colors border border-border flex items-center justify-center"
                        >
                          Cancel
                        </button>
                      </div>
                      {usernameError && (
                        <span className="text-xs font-semibold text-foreground tracking-tight">
                          • {usernameError}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="text-foreground font-bold text-base sm:text-lg">{user.username}</span>
                      <button
                        onClick={() => {
                          setNewUsername(user.username);
                          setIsEditing(true);
                        }}
                        className="text-xs text-subtle hover:text-foreground transition-colors font-medium border border-border hover:border-border bg-primary px-3 py-1.5 min-h-[36px] rounded flex items-center justify-center"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface-raised p-6 rounded-lg border border-border h-full">
              <h2 className="text-xl font-semibold text-subtle mb-4 border-b pb-2">Progression</h2>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton height={48} className="rounded-lg" />
                  <Skeleton height={48} className="rounded-lg" />
                  <div className="flex gap-4">
                    <Skeleton height={72} className="flex-1 rounded-lg" />
                    <Skeleton height={72} className="flex-1 rounded-lg" />
                  </div>
                  <Skeleton height={48} className="rounded-lg" />
                </div>
              ) : trainerSave ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-primary rounded-lg border border-border">
                    <span className="text-subtle font-medium">Player CP</span>
                    <span className="text-foreground font-black text-lg">{playerCp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary rounded-lg border border-border">
                    <span className="text-subtle font-medium">Rank</span>
                    <span className="text-foreground font-bold text-lg">{formatRank(trainerSave.rank)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 p-3 bg-surface rounded-lg border border-border flex flex-col">
                      <span className="text-muted font-medium text-xs uppercase tracking-widest">Astral Coins</span>
                      <div className="flex items-center gap-2 mt-2">
                        <img src="/astral.webp" alt="Astral" className="w-6 h-6 object-contain" />
                        <span className="text-foreground font-black text-xl">{trainerSave.astralCoins?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <div className="flex-1 p-3 bg-surface rounded-lg border border-border flex flex-col">
                      <span className="text-muted font-medium text-xs uppercase tracking-widest">Infinity Coins</span>
                      <div className="flex items-center gap-2 mt-2">
                        <img src="/infinity.webp" alt="Infinity" className="w-6 h-6 object-contain" />
                        <span className="text-foreground font-black text-xl">{trainerSave.infinityCoins?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary rounded-lg border border-border">
                    <span className="text-subtle font-medium">Badges</span>
                    <span className="text-foreground font-bold text-lg">{trainerSave.badges?.length || 0}</span>
                  </div>
                </div>
              ) : (
                <div className="text-subtle">Failed to load progression data.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

