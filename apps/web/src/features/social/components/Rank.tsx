import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/api';
import { ArrowDown, Trophy, ShieldCheck, Award, CheckCircle2, Circle } from 'lucide-react';
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
    return (
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <div className="text-center text-muted font-bold text-sm">Loading Rank Status...</div>
      </div>
    );
  }

  if (!statusResponse?.data) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <div className="text-center text-foreground font-bold text-sm">Failed to load rank status.</div>
      </div>
    );
  }

  const { currentRank, nextRank, requirementMet, requirements, progress, message } = statusResponse.data;

  const formatRank = (rank: string) => {
    if (!rank) return '';
    return rank.replace('_MINUS', '-').replace('_PLUS', '+') + ' Rank';
  };

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6">

        {/* Hero Banner Section */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden border border-border shadow-sm bg-surface">
          <img
            src="/banners/rank-hero.webp"
            alt="Trainer Rank Certification League"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
          {/* Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/25">
                    Official Certification
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white/70">
                    Trainer League
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  Trainer Rank
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-lg line-clamp-1 sm:line-clamp-none">
                  Fulfill roster requirements and challenge the Certification Examiner to advance your rank.
                </p>
              </div>

              {/* Current Standing Badge */}
              <div className="flex items-center gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                  <Award className="w-4 h-4 text-white/80" />
                  <span className="text-xs sm:text-sm font-black text-white">{formatRank(currentRank)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rank Certification Flow Card */}
        <div className="bg-surface rounded-3xl shadow-xs border border-border p-6 sm:p-8 flex flex-col items-center">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-8 border-b border-border pb-8 gap-4">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted px-3 py-1 rounded-full bg-surface-raised border border-border mb-2">
                Current Certification
              </span>
              <span className="text-2xl sm:text-3xl font-black text-foreground">{formatRank(currentRank)}</span>
            </div>

            <div className="w-12 h-12 flex items-center justify-center bg-surface-raised border border-border rounded-full shrink-0 shadow-xs">
              <ArrowDown className="w-5 h-5 text-muted rotate-0 sm:-rotate-90" />
            </div>

            <div className="flex flex-col items-center sm:items-end text-center sm:text-right flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted px-3 py-1 rounded-full bg-surface-raised border border-border mb-2">
                Next Rank Target
              </span>
              <span className="text-2xl sm:text-3xl font-black text-foreground">{nextRank ? formatRank(nextRank) : 'MAX RANK'}</span>
            </div>
          </div>

          {!nextRank ? (
            <div className="text-center p-8 space-y-3">
              <div className="w-16 h-16 bg-surface-raised rounded-2xl flex items-center justify-center mx-auto border border-border">
                <Trophy className="w-8 h-8 text-foreground" />
              </div>
              <span className="inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-surface-raised text-foreground border border-border">
                Pinnacle Achieved
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">Maximum Rank Reached</h2>
              <p className="text-sm text-muted font-medium max-w-md mx-auto">{message || 'You have achieved the ultimate trainer certification in Astranox.'}</p>
            </div>
          ) : (
            <div className="w-full max-w-lg space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-muted text-center">
                Promotion Requirements
              </h3>
              
              <div className="space-y-3">
                <div className="bg-surface-raised p-4 rounded-2xl border border-border flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {progress.pokemonAtPrimaryLevel >= requirements.count1 ? (
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted shrink-0" />
                    )}
                    <span className="text-sm font-bold text-foreground">
                      {requirements.count1} Pokémon at Lv. {requirements.minLevel}+
                    </span>
                  </div>
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
                  <div className="bg-surface-raised p-4 rounded-2xl border border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {progress.pokemonAtFallbackLevel >= requirements.countFallback ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted shrink-0" />
                      )}
                      <span className="text-sm font-bold text-foreground">
                        {requirements.countFallback} Pokémon at Lv. {requirements.minLevelFallback}+
                      </span>
                    </div>
                    <span className={`text-sm font-black ${progress.pokemonAtFallbackLevel >= requirements.countFallback ? 'text-success' : 'text-muted'}`}>
                      {progress.pokemonAtFallbackLevel} / {requirements.countFallback}
                    </span>
                  </div>
                )}

                {requirements.requiresLegendary && (
                  <div className="bg-surface-raised p-4 rounded-2xl border border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-foreground shrink-0" />
                      <span className="text-sm font-bold text-foreground">Own at least 1 Legendary Pokémon</span>
                    </div>
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
                    {examMutation.isPending ? 'Preparing Exam...' : 'Challenge Promotion Exam'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 px-6 bg-surface-raised text-muted font-bold rounded-xl border border-border min-h-[44px] text-sm flex items-center justify-center cursor-not-allowed"
                  >
                    Certification Requirements Not Met
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
