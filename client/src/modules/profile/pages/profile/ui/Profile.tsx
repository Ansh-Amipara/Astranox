import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/shared/api/api';
import { useAuthStore } from '@/modules/auth/store/auth.store';

export function Profile() {
  const { user, setAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');

  const updateProfileMutation = useMutation({
    mutationFn: async (username: string) => {
      const { data } = await api.post('/auth/update-profile', { username });
      return data;
    },
    onSuccess: (res) => {
      if (res.success && res.data) {
        setAuth(res.data.accessToken, res.data.user);
        setIsEditing(false);
        toast.success('Username updated successfully');
      }
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update username');
    }
  });

  const { data: trainerSave, isLoading } = useQuery({
    queryKey: ['trainer-me'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
    enabled: !!user,
  });

  const playerCp = trainerSave?.party?.reduce((sum: number, p: { cp?: number }) => sum + (p.cp || 0), 0) || 0;

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 mb-8">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Player Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 h-full">
              <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Character</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Username :</span>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded-md text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        autoFocus
                      />
                      <button
                        onClick={() => updateProfileMutation.mutate(newUsername)}
                        disabled={updateProfileMutation.isPending || !newUsername || newUsername === user.username}
                        className="text-xs bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 disabled:opacity-50 font-medium transition-colors"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setNewUsername(user.username);
                        }}
                        disabled={updateProfileMutation.isPending}
                        className="text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded hover:bg-slate-300 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-800 font-bold">{user.username}</span>
                      <button
                        onClick={() => {
                          setNewUsername(user.username);
                          setIsEditing(true);
                        }}
                        className="text-xs text-slate-500 hover:text-red-500 transition-colors font-medium border border-slate-200 hover:border-red-200 bg-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 h-full">
              <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Progression</h2>
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-full"></div>
                  <div className="h-5 bg-slate-200 rounded w-full"></div>
                  <div className="h-5 bg-slate-200 rounded w-full"></div>
                </div>
              ) : trainerSave ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Player CP</span>
                    <span className="text-blue-600 font-black">{playerCp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Rank</span>
                    <span className="text-slate-800 font-bold">{trainerSave.rank}</span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium text-xs uppercase tracking-widest">Astral Coins</span>
                      <div className="flex items-center gap-2 mt-1">
                        <img src="/astral.png" alt="Astral" className="w-5 h-5 object-contain" />
                        <span className="text-amber-500 font-black text-lg">{trainerSave.astralCoins?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-medium text-xs uppercase tracking-widest">Infinity Coins</span>
                      <div className="flex items-center gap-2 mt-1">
                        <img src="/infinity.png" alt="Infinity" className="w-5 h-5 object-contain" />
                        <span className="text-purple-500 font-black text-lg">{trainerSave.infinityCoins?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Badges</span>
                    <span className="text-slate-800 font-bold">{trainerSave.badges?.length || 0}</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500">Failed to load progression data.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
