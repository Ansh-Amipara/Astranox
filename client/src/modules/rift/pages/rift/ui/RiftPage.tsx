import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRiftState, useStartRiftRun, useGenerateRiftEncounter, useAbandonRiftRun } from '@/modules/rift/components/useRift';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Swords, Skull, ShieldAlert, AlertCircle, X, ChevronRight, ArrowLeft } from 'lucide-react';

const RANKS = [
  'F_RANK', 'E_RANK', 'D_RANK', 'C_RANK', 'B_RANK', 'A_RANK',
  'S_MINUS_RANK', 'S_RANK', 'S_PLUS_RANK', 'SS_MINUS_RANK', 'SS_RANK', 'SS_PLUS_RANK',
  'SSS_MINUS_RANK', 'SSS_RANK', 'SSS_PLUS_RANK'
];

const DIFFICULTIES = ['NORMAL', 'HARD', 'NIGHTMARE', 'ABYSS'];

const formatRankName = (rank: string) => {
  return rank.replace('_RANK', '').replace('_MINUS', '-').replace('_PLUS', '+').replace('_', ' ');
};

export const RiftPage: React.FC = () => {
  const { data, isLoading, error } = useRiftState();
  const startRun = useStartRiftRun();
  const generateEncounter = useGenerateRiftEncounter();
  const abandonRun = useAbandonRiftRun();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedRank, setSelectedRank] = useState<string>('F_RANK');
  const [step, setStep] = useState<'RANK' | 'DIFFICULTY'>('RANK');

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 min-h-[calc(100vh-64px)]">
        <div className="p-4 bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Error loading Rift state.
        </div>
      </div>
    );
  }

  const { state, rank } = data;
  const playerRankWeight = RANKS.indexOf(rank) || 0;

  const handleStart = (difficulty: string) => {
    startRun.mutate({ rank: selectedRank, difficulty }, {
      onSuccess: () => {
        toast.success(`Entered ${selectedRank.replace('_RANK', '')} Rift (${difficulty})`);
      },
      onError: (err: unknown) => {
        toast.error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to start Rift');
      }
    });
  };

  const handleGenerate = () => {
    generateEncounter.mutate(undefined, {
      onSuccess: () => {
        navigate('/battle?returnUrl=/rift');
      },
      onError: (err: unknown) => {
        toast.error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to start encounter');
        queryClient.invalidateQueries({ queryKey: ['riftState'] });
      }
    });
  };

  const handleAbandon = () => {
    if (confirm('Are you sure you want to abandon this Rift run?')) {
      abandonRun.mutate(undefined, {
        onSuccess: () => toast.success('Rift run abandoned.'),
      });
    }
  };

  if (!state.currentRunStartedAt) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 flex flex-col items-start w-full">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6 flex gap-3">
          Void Rifts
        </h1>
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col">
          {step === 'RANK' ? (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 text-left">Select Rift Tier</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 w-full pb-2">
                {RANKS.map((r, i) => {
                  const locked = i > playerRankWeight;
                  return (
                    <button
                      key={r}
                      disabled={locked}
                      onClick={() => { setSelectedRank(r); setStep('DIFFICULTY'); }}
                      className={`p-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center ${locked ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-50 cursor-not-allowed' :
                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                    >
                      {formatRankName(r)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-300 relative">
              <button
                onClick={() => setStep('RANK')}
                className="absolute -top-2 -left-2 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="Back to Ranks"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Selected Tier</h2>
                <span className="inline-block px-4 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-black rounded-lg border border-purple-200 dark:border-purple-800/50">
                  {formatRankName(selectedRank)}
                </span>
              </div>

              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Select Difficulty</h2>
              <div className="flex flex-col gap-3">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => handleStart(d)}
                    disabled={startRun.isPending}
                    className="p-4 rounded-xl text-left border transition-all flex justify-between items-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-white">{d}</span>
                      <span className="text-xs text-slate-500">
                        {d === 'NORMAL' ? '1.0x Infinity Coins • Normal Stats' :
                          d === 'HARD' ? '1.5x Infinity Coins • Increased Stats' :
                            d === 'NIGHTMARE' ? '2.5x Infinity Coins • Massive Stats' :
                              '4.0x Infinity Coins • Impossible Stats'}
                      </span>
                    </div>
                    {startRun.isPending ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Run View
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 flex flex-col items-start w-full">
      <div className="w-full bg-white dark:bg-slate-900 border border-purple-500/30 dark:border-purple-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purple-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <button onClick={handleAbandon} className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-8 sm:mb-10 mt-6 sm:mt-0">
          <h2 className="text-sm font-black text-purple-500 uppercase tracking-widest mb-2">Active Rift</h2>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
            {state.rank.replace('_MINUS_RANK', '-').replace('_PLUS_RANK', '+').replace('_RANK', '')} Tier
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-800/50">
              {state.difficulty}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">
              Floor {state.currentFloor}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={generateEncounter.isPending}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black py-4 sm:py-5 px-6 sm:px-16 rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl"
          >
            {generateEncounter.isPending ? <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" /> : <Swords className="w-6 h-6 sm:w-7 sm:h-7" />}
            {generateEncounter.isPending ? 'Generating...' : `Proceed to Floor ${state.currentFloor}`}
          </button>
        </div>
      </div>
    </div>
  );
};
