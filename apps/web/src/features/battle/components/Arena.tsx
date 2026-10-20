import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/api';
import { Swords, Loader2 } from 'lucide-react';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';

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

const RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export function ArenaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeRank, setActiveRank] = useState<string>('F');

  const { data: trainersResponse, isLoading } = useQuery({
    queryKey: ['arenaTrainers'],
    queryFn: () => api.get('/battles/arena-trainers').then(res => res.data)
  });

  const encounterMutation = useMutation({
    mutationFn: (trainerId: string) => api.post('/battles/arena-encounter', { trainerId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['battleSession'] });
      navigate(`/battle?returnUrl=/arena&arenaTrainerId=${variables}`);
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to start arena battle');
    }
  });

  const trainers: ArenaTrainer[] = trainersResponse?.data || [];

  const filteredTrainers = useMemo(() => {
    return trainers.filter(t => t.targetRank.startsWith(activeRank));
  }, [trainers, activeRank]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <Loader2 className="w-12 h-12 text-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Trainer Arena</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">Test your frontline team against certified division trainers</p>
        </div>

        {/* Tab Bar */}
        <div className="flex bg-surface-raised/80 p-1 rounded-2xl border border-border shadow-xs w-full sm:w-max gap-1 overflow-x-auto hide-scrollbar">
          {RANKS.map((rank) => (
            <button
              key={rank}
              onClick={() => setActiveRank(rank)}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold capitalize whitespace-nowrap transition-all touch-manipulation select-none flex items-center justify-center ${
                activeRank === rank
                  ? 'bg-surface text-foreground shadow-xs font-black'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Rank {rank}
            </button>
          ))}
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-surface rounded-2xl shadow-xs border border-border p-5 flex flex-col items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-full flex justify-between items-start mb-4">
                <span className="text-xs font-black px-2.5 py-1 bg-surface-raised border border-border rounded-full text-foreground uppercase tracking-wider">
                  Lv. {trainer.level}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 bg-surface-raised border border-border text-muted rounded-full capitalize">
                  {trainer.theme}
                </span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Swords className="w-8 h-8 text-foreground" />
              </div>

              <h3 className="text-base sm:text-lg font-black text-foreground text-center mb-0.5">
                {trainer.name}
              </h3>
              <p className="text-xs text-muted mb-5">
                {trainer.team.length} Pokémon Party
              </p>

              <button
                onClick={() => encounterMutation.mutate(trainer.id)}
                disabled={encounterMutation.isPending}
                className="w-full py-2.5 min-h-[44px] bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation select-none"
              >
                {encounterMutation.isPending && encounterMutation.variables === trainer.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Swords className="w-4 h-4" />
                )}
                Challenge Trainer
              </button>
            </div>
          ))}
          {filteredTrainers.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted font-medium bg-surface rounded-2xl border border-border">
              No trainers registered for Rank {activeRank}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
