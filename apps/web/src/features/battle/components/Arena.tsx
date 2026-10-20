import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/api';
import { Swords, Loader2, Shield, Users } from 'lucide-react';
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
        <Loader2 className="w-10 h-10 text-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* Hero Banner Section */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden border border-border shadow-sm bg-surface">
          <img
            src="/banners/arena-hero.webp"
            alt="Trainer Battle Arena Stadium"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
          {/* Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/25">
                    Sanctioned League
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white/70">
                    Division Ranks F–S
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  Trainer Arena
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-lg line-clamp-1 sm:line-clamp-none">
                  Test your frontline Pokémon team against certified trainers across competitive divisions.
                </p>
              </div>

              {/* Roster Badge */}
              <div className="flex items-center gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/80" />
                  <span className="text-xs sm:text-sm font-black text-white">{trainers.length} Certified Trainers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar Filter */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex bg-surface-raised/80 p-1 rounded-2xl border border-border shadow-xs w-full sm:w-max gap-1 overflow-x-auto hide-scrollbar">
            {RANKS.map((rank) => (
              <button
                key={rank}
                onClick={() => setActiveRank(rank)}
                className={`flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold capitalize whitespace-nowrap transition-all touch-manipulation select-none flex items-center justify-center ${
                  activeRank === rank
                    ? 'bg-surface text-foreground shadow-xs font-black border border-border'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Rank {rank}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted font-bold px-2">
            Showing {filteredTrainers.length} {filteredTrainers.length === 1 ? 'trainer' : 'trainers'} in Rank {activeRank}
          </span>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-surface rounded-3xl shadow-xs border border-border p-5 flex flex-col items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden"
            >
              <div className="w-full flex justify-between items-start mb-4">
                <span className="text-xs font-black px-3 py-1 bg-surface-raised border border-border rounded-full text-foreground uppercase tracking-wider">
                  Lv. {trainer.level}
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-surface-raised border border-border text-muted rounded-full capitalize">
                  {trainer.theme}
                </span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Swords className="w-8 h-8 text-foreground" />
              </div>

              <h3 className="text-base sm:text-lg font-black text-foreground text-center mb-0.5">
                {trainer.name}
              </h3>
              <p className="text-xs text-muted mb-5 font-medium">
                {trainer.team.length} Pokémon Party
              </p>

              <button
                onClick={() => encounterMutation.mutate(trainer.id)}
                disabled={encounterMutation.isPending}
                className="w-full py-3 min-h-[44px] bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation select-none"
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
            <div className="col-span-full py-16 text-center text-muted font-medium bg-surface rounded-3xl border border-border flex flex-col items-center justify-center space-y-3">
              <Shield className="w-12 h-12 text-muted" />
              <p className="text-sm">No certified trainers currently registered for Rank {activeRank}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
