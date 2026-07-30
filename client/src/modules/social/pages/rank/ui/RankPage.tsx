import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/api';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function RankPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: statusResponse, isLoading } = useQuery({
    queryKey: ['rankStatus'],
    queryFn: () => api.get('/rank/status').then(res => res.data)
  });

  const examMutation = useMutation({
    mutationFn: () => api.post('/rank/exam'),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['battleSession'] });
      navigate('/battle?returnUrl=/rank');
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      setSuccessMessage(null);
      setError(err.response?.data?.error?.message || 'Failed to start exam');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading Rank Status...</div>;
  }

  if (!statusResponse?.data) {
    return <div className="p-8 text-center text-red-500 font-bold">Failed to load rank status.</div>;
  }

  const { currentRank, nextRank, requirementMet, requirements, progress, message } = statusResponse.data;

  const formatRank = (rank: string) => {
    if (!rank) return '';
    return rank
      .replace('_MINUS_RANK', '-')
      .replace('_PLUS_RANK', '+')
      .replace('_RANK', '') + ' Rank';
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Trainer Rank</h1>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-bold rounded-xl border border-green-200 dark:border-green-800/50 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-800/50">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-700 pb-8">
          <div className="flex flex-col items-center flex-1">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Rank</span>
            <span className="text-4xl font-black text-slate-800 dark:text-white">{formatRank(currentRank)}</span>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full mx-4">
            <ArrowRight className="w-6 h-6 text-slate-400" />
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2">Next Rank</span>
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{nextRank ? formatRank(nextRank) : 'MAX RANK'}</span>
          </div>
        </div>

        {!nextRank ? (
          <div className="text-center p-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Maximum Rank Achieved!</h2>
            <p className="text-slate-500 font-medium">{message}</p>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 text-center">Promotion Requirements</h3>
            
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {requirements.count1} Pokémon reaching Lv. {requirements.minLevel}
                </span>
                <span className={`font-black ${progress.pokemonAtPrimaryLevel >= requirements.count1 ? 'text-green-500' : 'text-slate-400'}`}>
                  {progress.pokemonAtPrimaryLevel} / {requirements.count1}
                </span>
              </div>

              {requirements.minLevelFallback && (
                <div className="flex items-center justify-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">OR</span>
                </div>
              )}

              {requirements.minLevelFallback && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {requirements.countFallback} Pokémon reaching Lv. {requirements.minLevelFallback}
                  </span>
                  <span className={`font-black ${progress.pokemonAtFallbackLevel >= requirements.countFallback ? 'text-green-500' : 'text-slate-400'}`}>
                    {progress.pokemonAtFallbackLevel} / {requirements.countFallback}
                  </span>
                </div>
              )}

              {requirements.requiresLegendary && (
                <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800/50 flex justify-between items-center">
                  <span className="font-bold text-purple-700 dark:text-purple-300">Own at least 1 Legendary Pokémon</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 flex justify-center">
              {requirementMet ? (
                <button
                  onClick={() => examMutation.mutate()}
                  disabled={examMutation.isPending}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transform transition hover:-translate-y-1 w-full text-center"
                >
                  {examMutation.isPending ? 'Preparing Exam...' : 'Take Promotion Exam'}
                </button>
              ) : (
                <button
                  disabled
                  className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-black rounded-xl w-full text-center cursor-not-allowed"
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
