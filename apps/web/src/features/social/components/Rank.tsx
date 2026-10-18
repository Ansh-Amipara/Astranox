import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/api';
import { ArrowDown } from 'lucide-react';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';

export function RankPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: statusResponse, isLoading } = useQuery({
    queryKey: ['rankStatus'],
    queryFn: () => api.get('/rank/status').then(res => res.data)
  });

  const examMutation = useMutation({
    mutationFn: () => api.post('/rank/exam'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battleSession'] });
      navigate('/battle?returnUrl=/rank');
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to start exam');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-subtle font-bold">Loading Rank Status...</div>;
  }

  if (!statusResponse?.data) {
    return <div className="p-8 text-center text-foreground font-bold">Failed to load rank status.</div>;
  }

  const { currentRank, nextRank, requirementMet, requirements, progress, message } = statusResponse.data;

  const formatRank = (rank: string) => {
    if (!rank) return '';
    return rank.replace('_MINUS', '-').replace('_PLUS', '+') + ' Rank';
  };

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
      <div className="mb-4 sm:mb-8 border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Trainer Rank</h1>
      </div>


      <div className="bg-surface rounded-2xl shadow-sm border border-border p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full flex flex-col justify-center items-center mb-6 sm:mb-8 border-b border-border pb-6 sm:pb-8 gap-3 sm:gap-4">
          <div className="flex flex-col items-center w-full">
            <span className="text-xs sm:text-sm font-bold text-muted uppercase tracking-widest mb-1 sm:mb-2">Current Rank</span>
            <span className="text-2xl sm:text-4xl font-black text-foreground text-center">{formatRank(currentRank)}</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-surface-raised rounded-full my-1 sm:my-2">
            <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-muted" />
          </div>
          <div className="flex flex-col items-center w-full">
            <span className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-widest mb-1 sm:mb-2">Next Rank</span>
            <span className="text-2xl sm:text-4xl font-black text-foreground text-center">{nextRank ? formatRank(nextRank) : 'MAX RANK'}</span>
          </div>
        </div>

        {!nextRank ? (
          <div className="text-center p-8">
            <h2 className="text-2xl font-black text-foreground mb-2">Maximum Rank Achieved!</h2>
            <p className="text-subtle font-medium">{message}</p>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <h3 className="text-xl font-bold text-foreground mb-4 text-center">Promotion Requirements</h3>
            
            <div className="space-y-4">
              <div className="bg-surface-raised p-4 rounded-xl border border-border flex justify-between items-center">
                <span className="font-bold text-muted">
                  {requirements.count1} Pokémon reaching Lv. {requirements.minLevel}
                </span>
                <span className={`font-black ${progress.pokemonAtPrimaryLevel >= requirements.count1 ? 'text-foreground' : 'text-muted'}`}>
                  {progress.pokemonAtPrimaryLevel} / {requirements.count1}
                </span>
              </div>

              {requirements.minLevelFallback && (
                <div className="flex items-center justify-center">
                  <span className="text-xs font-black text-muted uppercase tracking-widest bg-surface-raised px-3 py-1 rounded-full">OR</span>
                </div>
              )}

              {requirements.minLevelFallback && (
                <div className="bg-surface-raised p-4 rounded-xl border border-border flex justify-between items-center">
                  <span className="font-bold text-muted">
                    {requirements.countFallback} Pokémon reaching Lv. {requirements.minLevelFallback}
                  </span>
                  <span className={`font-black ${progress.pokemonAtFallbackLevel >= requirements.countFallback ? 'text-foreground' : 'text-muted'}`}>
                    {progress.pokemonAtFallbackLevel} / {requirements.countFallback}
                  </span>
                </div>
              )}

              {requirements.requiresLegendary && (
                <div className="mt-4 bg-surface-raised p-4 rounded-xl border border-border/50 flex justify-between items-center">
                  <span className="font-bold text-foreground">Own at least 1 Legendary Pokémon</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-border flex justify-center">
              {requirementMet ? (
                <button
                  onClick={() => examMutation.mutate()}
                  disabled={examMutation.isPending}
                  className="px-8 py-4 bg-gradient-to-r from-surface to-surface-raised hover:from-surface hover:to-surface-raised text-foreground font-black rounded-xl shadow-lg shadow-glow transform transition hover:-translate-y-1 w-full text-center"
                >
                  {examMutation.isPending ? 'Preparing Exam...' : 'Take Promotion Exam'}
                </button>
              ) : (
                <button
                  disabled
                  className="px-8 py-4 bg-surface-raised text-muted font-black rounded-xl w-full text-center cursor-not-allowed"
                >
                  Requirements Not Met
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
