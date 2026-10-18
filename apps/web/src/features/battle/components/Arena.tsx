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
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-12 h-12 text-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">

        {/* Tab Bar */}
        <div className="flex bg-surface-raised p-1 rounded-lg w-full sm:w-max mb-6 gap-1 overflow-x-auto hide-scrollbar">
          {RANKS.map((rank) => (
            <button
              key={rank}
              onClick={() => setActiveRank(rank)}
              className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-bold capitalize whitespace-nowrap transition-colors flex items-center justify-center ${ activeRank === rank ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-foreground' }`}
            >
              {rank.replace('_MINUS', '-').replace('_PLUS', '+').replace('_', '').toLowerCase()}
            </button>
          ))}
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-surface rounded-2xl shadow-sm border border-border p-5 flex flex-col items-center hover:border-foreground/30 hover:shadow-glow transition-all group"
            >
              <div className="w-full flex justify-between items-start mb-4">
                <span className="text-xs font-black px-2 py-1 bg-surface-raised rounded-md text-subtle uppercase tracking-wider">
                  Lv. {trainer.level}
                </span>
                <span className="text-xs font-bold px-2 py-1 bg-surface-raised text-muted rounded-md">
                  {trainer.theme}
                </span>
              </div>

              <h3 className="text-xl font-black text-foreground text-center mb-1">
                {trainer.name}
              </h3>
              <p className="text-sm font-medium text-muted mb-6">
                {trainer.team.length} Pokémon
              </p>

              <button
                onClick={() => encounterMutation.mutate(trainer.id)}
                disabled={encounterMutation.isPending}
                className="w-full py-3 bg-primary text-primary-foreground font-black rounded-xl hover:bg-surface-raised hover:text-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="col-span-full py-12 text-center text-subtle font-medium">
              No trainers found for this rank.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
