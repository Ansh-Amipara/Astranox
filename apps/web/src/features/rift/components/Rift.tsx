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
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Void Rifts
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">Enter high-stakes void anomalies for rare rewards and ranked encounters</p>
          </div>

          <div className="w-full bg-surface border border-border rounded-2xl p-5 sm:p-8 shadow-xs flex flex-col">
            {step === 'MAJOR_RANK' ? (
              <div className="flex flex-col animate-in fade-in duration-200 w-full space-y-4">
                <h2 className="text-xs sm:text-sm font-black text-muted uppercase tracking-wider text-left">
                  Select Challenge Rank
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full">
                  {MAJOR_RANKS.map((r) => {
                    const requiredIndex = RANKS.indexOf(`${r}_MINUS`);
                    const locked = requiredIndex > playerRankWeight;
                    return (
                      <button
                        key={r}
                        disabled={locked}
                        onClick={() => { 
                          setSelectedMajorRank(r); 
                          setSelectedSubRank(r);
                          setStep('DETAILS'); 
                        }}
                        className={`p-3.5 sm:p-4 min-h-[48px] rounded-xl text-sm sm:text-base font-black border transition-all duration-200 flex items-center justify-center touch-manipulation select-none active:scale-[0.98] ${
                          locked
                            ? 'bg-surface-raised border-border text-muted opacity-40 cursor-not-allowed'
                            : 'bg-surface border-border text-foreground hover:bg-surface-raised hover:shadow-xs hover:-translate-y-0.5'
                        }`}
                      >
                        {r} Rank
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col animate-in fade-in duration-200 relative w-full space-y-6">
                <button
                  onClick={() => setStep('MAJOR_RANK')}
                  className="self-start -ml-2 p-2 min-h-[44px] flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground transition-colors touch-manipulation select-none"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Ranks
                </button>

                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-surface-raised text-foreground font-black rounded-full border border-border text-xs uppercase tracking-wider">
                    {selectedMajorRank} Rank Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                  {!['F', 'E', 'D', 'C', 'B', 'A', 'EX'].includes(selectedMajorRank) && (
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Sub-Rank</h3>
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
                              className={`flex-1 p-3 min-h-[44px] rounded-xl border font-black text-xs sm:text-sm transition-all touch-manipulation select-none active:scale-[0.98] ${
                                locked
                                  ? 'opacity-40 cursor-not-allowed bg-surface-raised text-muted border-border'
                                  : isSelected
                                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                  : 'bg-surface text-muted border-border hover:bg-surface-raised'
                              }`}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Difficulty</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {DIFFICULTIES.map(d => {
                        const isSelected = selectedDifficulty === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setSelectedDifficulty(d)}
                            className={`p-3 min-h-[44px] rounded-xl border font-black text-xs transition-all touch-manipulation select-none active:scale-[0.98] ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'bg-surface text-muted border-border hover:bg-surface-raised'
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleStart}
                    disabled={startRun.isPending}
                    className="w-full sm:w-auto bg-primary text-primary-foreground font-black py-3 px-10 min-h-[44px] rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 touch-manipulation select-none"
                  >
                    {startRun.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
                    Enter Rift!
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Run View
  return (
    <div className="flex-1 bg-background p-3 sm:p-4 md:p-6 flex flex-col items-start w-full">
      <div className="w-full max-w-3xl mx-auto bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-xs relative overflow-hidden text-center space-y-6">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <button
            onClick={handleAbandon}
            title="Abandon Run"
            className="text-muted hover:text-danger transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-surface-raised rounded-full border border-border touch-manipulation select-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mt-2">
          <span className="text-xs font-black text-muted uppercase tracking-wider px-3 py-1 bg-surface-raised border border-border rounded-full">
            Active Rift Anomaly
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground">
            {formatRankName(state.rank)} Tier
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-0.5 bg-surface-raised text-foreground text-xs font-bold rounded-full border border-border">
              {state.difficulty}
            </span>
            <span className="px-3 py-0.5 bg-surface-raised text-muted text-xs font-bold rounded-full border border-border">
              Floor {state.currentFloor}
            </span>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={handleGenerate}
            disabled={generateEncounter.isPending}
            className="w-full sm:w-auto bg-primary text-primary-foreground font-black py-3.5 px-10 min-h-[44px] rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation select-none"
          >
            {generateEncounter.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
            {generateEncounter.isPending ? 'Generating Encounter...' : `Proceed to Floor ${state.currentFloor}`}
          </button>
        </div>
      </div>
    </div>
  );
};

