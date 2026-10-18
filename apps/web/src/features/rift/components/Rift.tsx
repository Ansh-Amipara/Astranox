import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRiftState, useStartRiftRun, useGenerateRiftEncounter, useAbandonRiftRun } from '../hooks/useRift';
import { useNavigate } from 'react-router-dom';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { Loader2, Swords, AlertCircle, X, ArrowLeft } from 'lucide-react';

const RANKS = [
  'F', 'E',
  'D', 'C', 'B',
  'A', 'S_MINUS', 'S',
  'S_PLUS', 'SS_MINUS', 'SS',
  'SS_PLUS', 'SSS_MINUS', 'SSS',
  'SSS_PLUS', 'EX'
];

const MAJOR_RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'EX'];

const DIFFICULTIES = ['NORMAL', 'HARD', 'NIGHTMARE', 'ABYSS'];

const formatRankName = (rank: string) => {
  return rank.replace('_MINUS', '-').replace('_PLUS', '+').replace('_', ' ');
};

export const RiftPage: React.FC = () => {
  const { data, isLoading, error } = useRiftState();
  const startRun = useStartRiftRun();
  const generateEncounter = useGenerateRiftEncounter();
  const abandonRun = useAbandonRiftRun();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedMajorRank, setSelectedMajorRank] = useState<string>('F');
  const [selectedSubRank, setSelectedSubRank] = useState<string>('F');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('NORMAL');
  const [step, setStep] = useState<'MAJOR_RANK' | 'DETAILS'>('MAJOR_RANK');

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <Loader2 className="w-12 h-12 text-foreground animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center p-4 sm:p-6 min-h-[calc(100dvh-64px)]">
        <div className="p-4 bg-surface-raised text-foreground font-bold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Error loading Rift state.
        </div>
      </div>
    );
  }

  const { state, rank } = data;
  const playerRankWeight = RANKS.indexOf(rank) || 0;

  const handleStart = () => {
    startRun.mutate({ rank: selectedSubRank, difficulty: selectedDifficulty }, {
      onSuccess: () => {
        notify.success(`Entered ${formatRankName(selectedSubRank)} Rift (${selectedDifficulty})`);
      },
      onError: (err: unknown) => {
        notify.error(parseApiError(err).message || 'Failed to start Rift');
      }
    });
  };

  const handleGenerate = () => {
    generateEncounter.mutate(undefined, {
      onSuccess: () => {
        navigate('/battle?returnUrl=/rift');
      },
      onError: (err: unknown) => {
        notify.error(parseApiError(err).message || 'Failed to start encounter');
        queryClient.invalidateQueries({ queryKey: ['riftState'] });
      }
    });
  };

  const handleAbandon = () => {
    if (confirm('Are you sure you want to abandon this Rift run?')) {
      abandonRun.mutate(undefined, {
        onSuccess: () => notify.success('Rift run abandoned.'),
      });
    }
  };

  if (!state.currentRunStartedAt) {
    return (
      <div className="flex-1 bg-background p-3 sm:p-4 md:p-6 flex flex-col items-start w-full">
        <h1 className="text-2xl sm:text-4xl font-black text-foreground mb-4 sm:mb-6 flex gap-3">
          Void Rifts
        </h1>
        <div className="w-full bg-surface border border-border rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col">
          {step === 'MAJOR_RANK' ? (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
              <h2 className="text-xs sm:text-sm font-black text-muted uppercase tracking-widest mb-4 text-left">Select Major Rank</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full pb-2">
                {MAJOR_RANKS.map((r) => {
                  const requiredIndex = RANKS.indexOf(`${r}_MINUS`);
                  const locked = requiredIndex > playerRankWeight;
                  return (
                    <button
                      key={r}
                      disabled={locked}
                      onClick={() => { 
                        setSelectedMajorRank(r); 
                        setSelectedSubRank(r); // default to standard
                        setStep('DETAILS'); 
                      }}
                      className={`p-3 sm:p-4 min-h-[48px] rounded-xl text-base sm:text-lg font-black border transition-all flex items-center justify-center ${locked ? 'bg-surface-raised border-border text-muted opacity-50 cursor-not-allowed' : 'bg-surface border-border text-muted hover:border-border hover:shadow-md hover:-translate-y-0.5' }`}
                    >
                      {r} Rank
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-300 relative w-full">
              <button
                onClick={() => setStep('MAJOR_RANK')}
                className="absolute -top-2 -left-2 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-subtle transition-colors"
                title="Back to Ranks"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xs sm:text-sm font-black text-muted uppercase tracking-widest mb-1">Configuration</h2>
                <span className="inline-block px-4 py-1 bg-surface-raised text-foreground font-black rounded-lg border border-border/50 text-sm">
                  {selectedMajorRank} Rank
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mx-auto">
                {!['F', 'E', 'D', 'C', 'B', 'A', 'EX'].includes(selectedMajorRank) && (
                  <div className="flex flex-col">
                    <h3 className="text-xs sm:text-sm font-bold text-subtle uppercase tracking-wider mb-3">Sub-Rank</h3>
                    <div className="flex gap-2">
                      {[
                        { id: `${selectedMajorRank}_MINUS`, label: '-' },
                        { id: selectedMajorRank, label: 'Standard' },
                        { id: `${selectedMajorRank}_PLUS`, label: '+' }
                      ].map(sub => {
                        const locked = RANKS.indexOf(sub.id) > playerRankWeight;
                        const isSelected = selectedSubRank === sub.id;
                        return (
                          <button
                            key={sub.id}
                            disabled={locked}
                            onClick={() => setSelectedSubRank(sub.id)}
                            className={`flex-1 p-3 min-h-[44px] rounded-lg border font-bold transition-colors ${ locked ? 'opacity-50 cursor-not-allowed bg-surface-raised text-muted border-border' : isSelected ? 'bg-surface-raised text-foreground border-border' : 'bg-surface text-muted border-border hover:border-border' }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  <h3 className="text-xs sm:text-sm font-bold text-subtle uppercase tracking-wider mb-3">Difficulty</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {DIFFICULTIES.map(d => {
                      const isSelected = selectedDifficulty === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setSelectedDifficulty(d)}
                          className={`p-3 min-h-[44px] rounded-lg border font-bold text-xs sm:text-sm transition-colors ${ isSelected ? 'bg-surface-raised text-foreground border-border' : 'bg-surface text-muted border-border hover:border-border' }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex justify-center">
                <button
                  onClick={handleStart}
                  disabled={startRun.isPending}
                  className="w-full sm:w-auto bg-surface-raised hover:bg-surface-raised text-foreground font-black py-4 px-8 sm:px-12 min-h-[44px] rounded-xl transition-all shadow-lg shadow-glow active:scale-95 flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                >
                  {startRun.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Swords className="w-6 h-6" />}
                  FIGHT!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Run View
  return (
    <div className="flex-1 bg-background p-3 sm:p-4 md:p-6 flex flex-col items-start w-full">
      <div className="w-full bg-surface border border-border/30 rounded-3xl p-4 sm:p-8 shadow-2xl shadow-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 sm:p-4">
          <button onClick={handleAbandon} className="text-muted hover:text-foreground transition-colors p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-surface-raised rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6 sm:mb-10 mt-6 sm:mt-0">
          <h2 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest mb-2">Active Rift</h2>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground mb-2">
            {formatRankName(state.rank)} Tier
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-surface-raised text-foreground text-xs font-bold rounded-full border border-border/50">
              {state.difficulty}
            </span>
            <span className="px-3 py-1 bg-surface-raised text-muted text-xs font-bold rounded-full">
              Floor {state.currentFloor}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={generateEncounter.isPending}
            className="w-full sm:w-auto bg-surface-raised hover:bg-surface-raised text-foreground font-black py-4 sm:py-5 px-6 sm:px-16 min-h-[44px] rounded-2xl transition-all shadow-xl shadow-glow active:scale-95 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-xl"
          >
            {generateEncounter.isPending ? <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" /> : <Swords className="w-6 h-6 sm:w-7 sm:h-7" />}
            {generateEncounter.isPending ? 'Generating...' : `Proceed to Floor ${state.currentFloor}`}
          </button>
        </div>
      </div>
    </div>
  );
};

