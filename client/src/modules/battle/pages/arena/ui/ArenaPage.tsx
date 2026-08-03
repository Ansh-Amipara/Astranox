import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/api';
import { Swords, Loader2, Coins, Sparkles } from 'lucide-react';

interface ArenaTrainer {
  id: string;
  name: string;
  targetRank: string;
  level: number;
  team: string[];
  coins: number;
  xp: number;
  theme: string;
}

const RANKS = ['F_RANK', 'E_RANK', 'D_RANK', 'C_RANK', 'B_RANK', 'A_RANK', 'S_MINUS_RANK'];

export function ArenaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeRank, setActiveRank] = useState<string>('F_RANK');
  const [error, setError] = useState<string | null>(null);

  const { data: trainersResponse, isLoading } = useQuery({
    queryKey: ['arenaTrainers'],
    queryFn: () => api.get('/battles/arena-trainers').then(res => res.data)
  });

  const encounterMutation = useMutation({
    mutationFn: (trainerId: string) => api.post('/battles/arena-encounter', { trainerId }),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['battleSession'] });
      navigate('/battle?returnUrl=/arena');
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      setError(err.response?.data?.error?.message || 'Failed to start arena battle');
    }
  });

  const trainers: ArenaTrainer[] = trainersResponse?.data || [];

  const filteredTrainers = useMemo(() => {
    return trainers.filter(t => t.targetRank === activeRank);
  }, [trainers, activeRank]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-max mb-6 gap-1 overflow-x-auto hide-scrollbar">
          {RANKS.map((rank) => (
            <button
              key={rank}
              onClick={() => setActiveRank(rank)}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-bold capitalize whitespace-nowrap transition-colors flex items-center justify-center ${activeRank === rank
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {rank.replace('_MINUS_RANK', '-').replace('_PLUS_RANK', '+').replace('_RANK', '').toLowerCase()}
            </button>
          ))}
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center hover:border-red-500/50 hover:shadow-red-500/10 transition-all group"
            >
              <div className="w-full flex justify-between items-start mb-4">
                <span className="text-xs font-black px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-md text-slate-500 uppercase tracking-wider">
                  Lv. {trainer.level}
                </span>
                <span className="text-xs font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                  {trainer.theme}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-1">
                {trainer.name}
              </h3>
              <p className="text-sm font-medium text-slate-400 mb-6">
                {trainer.team.length} Pokémon
              </p>


              <button
                onClick={() => encounterMutation.mutate(trainer.id)}
                disabled={encounterMutation.isPending}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {encounterMutation.isPending && encounterMutation.variables === trainer.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Swords className="w-5 h-5" />
                )}
                Challenge
              </button>
            </div>
          ))}
          {filteredTrainers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium">
              No trainers found for this rank.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
