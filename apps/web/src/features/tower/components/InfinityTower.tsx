import React from 'react';
import { useTowerState, useStartTowerBattle, useSkipTowerFloors } from '../hooks/useTower';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { OwnedPokemonDto } from '@astranox/types';

import { Loader2, AlertCircle, Mountain, Swords, FastForward, Trophy, ShieldAlert, Sparkles } from 'lucide-react';

export const InfinityTowerPage: React.FC = () => {
  const { data, isLoading, error } = useTowerState();
  const startBattle = useStartTowerBattle();
  const skipFloors = useSkipTowerFloors();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <Loader2 className="w-10 h-10 text-foreground animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 bg-background p-4 sm:p-6 flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <div className="p-5 bg-surface text-foreground rounded-2xl border border-border shadow-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <span className="text-sm font-bold text-muted">Error loading Infinity Tower state. Please try again.</span>
        </div>
      </div>
    );
  }

  const { state, activeEncounter } = data;

  const handleStartBattle = () => {
    if (activeEncounter && !startBattle.isPending) {
      startBattle.mutate(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['battleSession'] });
          navigate('/battle?returnUrl=/tower');
        },
        onError: (err: unknown) => {
          notify.error(parseApiError(err).message || 'Failed to start battle');
        }
      });
    }
  };

  const handleSkipFloors = () => {
    if (!skipFloors.isPending) {
      skipFloors.mutate(undefined, {
        onSuccess: (res: unknown) => {
          const skipResult = (res as { skipResult?: { skippedCount: number, startFloor: number, endFloor: number, accumulatedCoins: number, accumulatedXp: number } })?.skipResult;
          if (skipResult) {
            notify.success(
              `Skipped ${skipResult.skippedCount} floors (Floor ${skipResult.startFloor} ➔ ${skipResult.endFloor})! Rewards: +${skipResult.accumulatedCoins} Coins, +${skipResult.accumulatedXp} XP`
            );
          }
        },
        onError: (err: unknown) => {
          notify.error(parseApiError(err).message || 'Failed to skip floors');
        }
      });
    }
  };

  const isConquered = state.currentFloor > 1000;
  const isBossFloor = !isConquered && state.currentFloor % 50 === 0 && state.currentFloor % 100 !== 0;
  const isMegaBossFloor = !isConquered && state.currentFloor % 100 === 0;
  const isMiniBossFloor = !isConquered && !isBossFloor && !isMegaBossFloor && state.currentFloor % 25 === 0;

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full max-w-6xl mx-auto space-y-4 md:space-y-6">

        {/* Header Section */}
        <div className="w-full bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-surface-raised text-muted border border-border">
                  Ascension Protocol
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-muted">
                  1000 Floors
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
                Infinity Tower
              </h1>
              <p className="text-xs sm:text-sm text-muted max-w-lg">
                Ascend floor by floor against scaling rosters to earn stored XP and Infinity Coins.
              </p>
            </div>

            {/* Player Stats Chips */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="bg-surface-raised border border-border px-3.5 py-1.5 rounded-xl flex flex-col">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Your CP</span>
                <span className="text-xs sm:text-sm font-black text-foreground">{data?.playerCp?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-surface-raised border border-border px-3.5 py-1.5 rounded-xl flex flex-col">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Highest Floor</span>
                <span className="text-xs sm:text-sm font-black text-foreground">{Math.min(1000, state.highestFloor)} / 1000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Floor Stage Area */}
        <div className="flex flex-col w-full space-y-4">

          {/* Floor Header Bar */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border flex items-center justify-center shrink-0">
                {isMegaBossFloor ? (
                  <Sparkles className="w-6 h-6 text-foreground" />
                ) : isBossFloor ? (
                  <ShieldAlert className="w-6 h-6 text-foreground" />
                ) : (
                  <Mountain className="w-6 h-6 text-foreground" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    {isConquered ? 'Floor 1000 / 1000' : `Floor ${state.currentFloor} / 1000`}
                  </h2>
                  {isConquered ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-raised text-foreground border border-border">
                      CONQUERED
                    </span>
                  ) : (isMegaBossFloor || isBossFloor || isMiniBossFloor) && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-raised text-foreground border border-border">
                      {isMegaBossFloor ? 'MEGA BOSS' : isBossFloor ? 'BOSS' : 'MINI BOSS'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted font-medium">
                  {isConquered
                    ? 'All 1000 challenge floors cleared'
                    : `Scaling difficulty tier ${Math.floor((state.currentFloor - 1) / 50) + 1} of 20`}
                </span>
              </div>
            </div>

            {!isConquered && data?.floorCp && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted bg-surface-raised px-3.5 py-1.5 rounded-xl border border-border">
                  Enemy Floor CP: <strong className="text-foreground">{data.floorCp.toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Challenge Content */}
          {isConquered ? (
            <div className="w-full bg-surface border border-border rounded-3xl p-8 sm:p-14 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-surface-raised rounded-3xl flex items-center justify-center border border-border shadow-xs">
                <Trophy className="w-10 h-10 text-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                  Infinity Tower Conquered!
                </h3>
                <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
                  You have scaled the highest peak of the Infinity Tower and defeated every guardian across all 1000 floors.
                </p>
              </div>
            </div>
          ) : activeEncounter ? (
            <div className="w-full bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col items-center space-y-6">
              
              {/* Enemy Team Presentation */}
              <div className="w-full space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted text-center block">
                  Guardian Frontline
                </span>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full">
                  {(activeEncounter.enemyTeam as OwnedPokemonDto[]).map((pokemon: OwnedPokemonDto, index: number) => (
                    <div key={index} className="group flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface-raised rounded-2xl flex items-center justify-center mb-2 border border-border shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-md relative overflow-hidden">
                        <img
                          src={`https://res.cloudinary.com/d0baluu2/image/upload/astranox/pokemon/${pokemon.species?.id}.png`}
                          alt={pokemon.species?.name}
                          loading="lazy"
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain pixelated"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-foreground capitalize text-center leading-tight max-w-[100px] sm:max-w-[120px] break-words">
                        {pokemon.species?.name}
                      </span>
                      <span className="text-[10px] font-bold text-muted">Lv. {pokemon.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards Card */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-raised border border-border rounded-2xl p-4 max-w-xl mx-auto">
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-xs border border-border shrink-0">
                    <img src="/infinity.webp" alt="Infinity Coins" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider">Floor Rewards</span>
                    <span className="text-base sm:text-lg font-black text-foreground leading-none">
                      +{(activeEncounter.reward as { infinityCoins?: number })?.infinityCoins || 0} Coins
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center sm:border-l border-border py-2 sm:py-0">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-xs border border-border shrink-0">
                    <img src="/xp.webp" alt="Stored XP" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider">Stored Experience</span>
                    <span className="text-base sm:text-lg font-black text-foreground leading-none">
                      +{(activeEncounter.reward as { storedXp?: number })?.storedXp || 0} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex justify-center pt-2">
                {data.floorCp && data.playerCp && data.floorCp < data.playerCp * 0.1 ? (
                  <button
                    onClick={handleSkipFloors}
                    disabled={skipFloors.isPending}
                    className="w-full sm:w-auto bg-primary text-primary-foreground font-black py-3.5 px-10 min-h-[44px] rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation select-none"
                  >
                    {skipFloors.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FastForward className="w-5 h-5" />}
                    {skipFloors.isPending ? 'Skipping Floors...' : 'Skip Weak Floors'}
                  </button>
                ) : (
                  <button
                    onClick={handleStartBattle}
                    disabled={startBattle.isPending}
                    className="w-full sm:w-auto bg-primary text-primary-foreground font-black py-3.5 px-10 min-h-[44px] rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation select-none"
                  >
                    {startBattle.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
                    {startBattle.isPending ? 'Preparing Arena...' : 'Challenge Floor'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full bg-surface border border-border rounded-2xl p-8 flex flex-col items-center shadow-xs">
              <Loader2 className="w-8 h-8 text-foreground animate-spin mb-3" />
              <p className="text-muted text-sm font-medium">Generating Floor Encounter...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
