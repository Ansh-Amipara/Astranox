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
    <div className="w-full min-h-[calc(100dvh-64px)] p-4 sm:p-6 md:p-10 flex flex-col bg-background">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-border pb-5 text-left">
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">Trainer Profile</h1>
          <p className="text-sm text-muted font-medium mt-1">Manage your trainer identity and view career progression</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Character Card */}
          <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-surface-raised border border-border">
                  Identity
                </span>
              </div>
              <h2 className="text-lg font-black text-foreground mb-4">Character Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted block mb-1.5">Trainer Name</label>
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => {
                            setNewUsername(e.target.value);
                            setUsernameError(null);
                          }}
                          className="px-3.5 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-border focus:ring-1 focus:ring-border bg-surface text-foreground min-h-[44px] flex-1 shadow-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => updateProfileMutation.mutate(newUsername)}
                          disabled={updateProfileMutation.isPending || !newUsername || newUsername === user.username}
                          className="min-h-[44px] px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-xs flex items-center justify-center active:scale-[0.98] touch-manipulation select-none"
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
                          className="min-h-[44px] px-4 py-2 text-xs font-bold bg-surface-raised text-muted hover:text-foreground rounded-xl transition-all border border-border flex items-center justify-center active:scale-[0.98] touch-manipulation select-none"
                        >
                          Cancel
                        </button>
                      </div>
                      {usernameError && (
                        <span className="text-xs font-semibold text-danger">
                          • {usernameError}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 bg-surface-raised rounded-xl border border-border">
                      <span className="text-foreground font-black text-base">{user.username}</span>
                      <button
                        onClick={() => {
                          setNewUsername(user.username);
                          setIsEditing(true);
                        }}
                        className="text-xs text-muted hover:text-foreground transition-colors font-bold border border-border bg-surface px-3 py-1.5 min-h-[36px] rounded-lg shadow-xs flex items-center justify-center touch-manipulation select-none"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-muted block mb-1.5">Account Role</label>
                  <div className="p-3.5 bg-surface-raised rounded-xl border border-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted">Permission Level</span>
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface text-foreground border border-border">
                      {user.role || 'USER'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-subtle mt-6 pt-4 border-t border-border">
              Astranox Trainer Account
            </p>
          </div>

          {/* Progression Card */}
          <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-surface-raised border border-border">
                  Career
                </span>
              </div>
              <h2 className="text-lg font-black text-foreground mb-4">Progression Stats</h2>

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton height={48} className="rounded-xl" />
                  <Skeleton height={48} className="rounded-xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton height={68} className="rounded-xl" />
                    <Skeleton height={68} className="rounded-xl" />
                  </div>
                </div>
              ) : trainerSave ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3.5 bg-surface-raised rounded-xl border border-border">
                    <span className="text-sm font-bold text-muted">Combat Power (CP)</span>
                    <span className="text-foreground font-black text-base font-mono">{playerCp.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3.5 bg-surface-raised rounded-xl border border-border">
                    <span className="text-sm font-bold text-muted">Trainer Rank</span>
                    <span className="text-foreground font-black text-base">{formatRank(trainerSave.rank)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-surface-raised rounded-xl border border-border flex flex-col justify-between">
                      <span className="text-muted font-bold text-[10px] uppercase tracking-wider">Astral Coins</span>
                      <div className="flex items-center gap-2 mt-2">
                        <img src="/astral.webp" alt="Astral" className="w-5 h-5 object-contain" />
                        <span className="text-foreground font-black text-base font-mono">{trainerSave.astralCoins?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    
                    <div className="p-3.5 bg-surface-raised rounded-xl border border-border flex flex-col justify-between">
                      <span className="text-muted font-bold text-[10px] uppercase tracking-wider">Infinity Coins</span>
                      <div className="flex items-center gap-2 mt-2">
                        <img src="/infinity.webp" alt="Infinity" className="w-5 h-5 object-contain" />
                        <span className="text-foreground font-black text-base font-mono">{trainerSave.infinityCoins?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3.5 bg-surface-raised rounded-xl border border-border">
                    <span className="text-sm font-bold text-muted">Gym Badges</span>
                    <span className="text-foreground font-black text-base font-mono">{trainerSave.badges?.length || 0}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-subtle font-medium p-4 text-center">Failed to load progression data.</div>
              )}
            </div>

            <p className="text-xs text-subtle mt-6 pt-4 border-t border-border">
              Stats update automatically in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

