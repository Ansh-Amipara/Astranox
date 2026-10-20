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
    <div className="flex-1 bg-background text-foreground p-4 sm:p-6 md:p-10 min-h-[calc(100dvh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="border-b border-border pb-5 text-left">
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">Trainer Rank</h1>
          <p className="text-sm text-muted font-medium mt-1">Complete certification requirements to challenge the Promotion Exam</p>
        </div>

        <div className="bg-surface rounded-2xl shadow-xs border border-border p-6 sm:p-8 flex flex-col items-center">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-8 border-b border-border pb-8 gap-4">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-surface-raised border border-border mb-2">
                Current Rank
              </span>
              <span className="text-2xl sm:text-3xl font-black text-foreground">{formatRank(currentRank)}</span>
            </div>

            <div className="w-10 h-10 flex items-center justify-center bg-surface-raised border border-border rounded-full shrink-0">
              <ArrowDown className="w-5 h-5 text-muted rotate-0 sm:-rotate-90" />
            </div>

            <div className="flex flex-col items-center sm:items-end text-center sm:text-right flex-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-surface-raised border border-border mb-2">
                Next Rank
              </span>
              <span className="text-2xl sm:text-3xl font-black text-foreground">{nextRank ? formatRank(nextRank) : 'MAX RANK'}</span>
            </div>
          </div>

          {!nextRank ? (
            <div className="text-center p-8 space-y-2">
              <span className="inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
                Pinnacle Achieved
              </span>
              <h2 className="text-2xl font-black text-foreground">Maximum Rank Reached</h2>
              <p className="text-sm text-muted font-medium max-w-md mx-auto">{message || 'You have reached the highest trainer rank in Astranox.'}</p>
            </div>
          ) : (
            <div className="w-full max-w-lg space-y-6">
              <h3 className="text-base font-black text-foreground text-center">Promotion Requirements</h3>
              
              <div className="space-y-3">
                <div className="bg-surface-raised p-4 rounded-xl border border-border flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">
                    {requirements.count1} Pokémon reaching Lv. {requirements.minLevel}
                  </span>
                  <span className={`text-sm font-black ${progress.pokemonAtPrimaryLevel >= requirements.count1 ? 'text-success' : 'text-muted'}`}>
                    {progress.pokemonAtPrimaryLevel} / {requirements.count1}
                  </span>
                </div>

                {requirements.minLevelFallback && (
                  <div className="flex items-center justify-center">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest bg-surface px-3 py-0.5 rounded-full border border-border">OR</span>
                  </div>
                )}

                {requirements.minLevelFallback && (
                  <div className="bg-surface-raised p-4 rounded-xl border border-border flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">
                      {requirements.countFallback} Pokémon reaching Lv. {requirements.minLevelFallback}
                    </span>
                    <span className={`text-sm font-black ${progress.pokemonAtFallbackLevel >= requirements.countFallback ? 'text-success' : 'text-muted'}`}>
                      {progress.pokemonAtFallbackLevel} / {requirements.countFallback}
                    </span>
                  </div>
                )}

                {requirements.requiresLegendary && (
                  <div className="bg-surface-raised p-4 rounded-xl border border-border flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">Own at least 1 Legendary Pokémon</span>
                    <span className="text-xs font-bold text-muted">Required</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-center">
                {requirementMet ? (
                  <button
                    onClick={() => examMutation.mutate()}
                    disabled={examMutation.isPending}
                    className="w-full py-3.5 px-6 bg-primary hover:opacity-90 text-primary-foreground font-black rounded-xl shadow-xs transition-all active:scale-[0.98] min-h-[44px] text-sm flex items-center justify-center touch-manipulation select-none"
                  >
                    {examMutation.isPending ? 'Preparing Exam...' : 'Take Promotion Exam'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 px-6 bg-surface-raised text-muted font-bold rounded-xl border border-border min-h-[44px] text-sm flex items-center justify-center cursor-not-allowed"
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
