import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api/api';

export function Gyms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: npcs, isLoading } = useQuery({
    queryKey: ['npcs'],
    queryFn: async () => {
      const { data } = await api.get('/npcs');
      return data.data;
    },
  });

  const challengeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/npcs/${id}/challenge`);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate active session and navigate to battle
      queryClient.invalidateQueries({ queryKey: ['activeBattle'] });
      navigate('/battle');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || 'Failed to start battle');
    }
  });

  if (isLoading) {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Gym Leaders & Bosses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {npcs?.map((npc: any) => (
          <div key={npc.id} className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm flex flex-col ${npc.isDefeated ? 'border-green-500 dark:border-green-500/50' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="p-6 flex flex-col items-center flex-1">
              <img src={npc.spriteUrl} alt={npc.name} className="w-24 h-24 object-contain pixelated mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{npc.name}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{npc.trainerClass}</p>
              {npc.badgeName && (
                <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 rounded-full text-xs font-bold mb-4">
                  {npc.badgeName}
                </div>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-400">Prize: ₽ {npc.rewardMoney}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Team Size: {npc.party.length}</p>
              
              {npc.isDefeated && (
                <div className="mt-auto w-full py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-center font-bold rounded-lg text-sm">
                  DEFEATED
                </div>
              )}
            </div>
            
            <button
              onClick={() => challengeMutation.mutate(npc.id)}
              disabled={challengeMutation.isPending}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50"
            >
              {challengeMutation.isPending ? 'Starting...' : 'CHALLENGE'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
