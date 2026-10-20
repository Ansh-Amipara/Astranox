import { useTowerState, useStartTowerBattle, useSkipTowerFloors } from '../hooks/useTower';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { OwnedPokemonDto } from '@astranox/types';

import { Loader2, AlertCircle, Mountain, Swords, FastForward } from 'lucide-react';

export const InfinityTowerPage: React.FC = () => {
  const { data, isLoading, error } = useTowerState();
  const startBattle = useStartTowerBattle();
  const skipFloors = useSkipTowerFloors();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <Loader2 className="w-12 h-12 text-foreground animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 bg-background p-4 sm:p-6 flex items-center justify-center min-h-[calc(100dvh-64px)]">
        <div className="p-4 bg-surface-raised text-foreground text-muted font-bold rounded-xl border border-border/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Error loading tower state.
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
      <div className="w-full mx-auto space-y-4 md:space-y-6">

        {/* Header Section */}
        <div className="mb-4 border-b border-border pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                Infinity Tower
              </h1>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <div className="bg-surface border border-border px-3 sm:px-4 py-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 shadow-sm w-full sm:w-auto">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Your CP: <span className="text-foreground">{data?.playerCp?.toLocaleString() || 0}</span></span>
                  <div className="hidden sm:block w-px h-4 bg-surface-raised"></div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Highest Floor: {Math.min(1000, state.highestFloor)} / 1000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col py-2 px-0 md:px-4 w-full flex-1">

          <div className="text-center mb-6">
            <h2 className={`text-2xl sm:text-4xl font-black mb-2 tracking-tighter ${isMegaBossFloor ? 'text-foreground' : isBossFloor ? 'text-foreground' : isMiniBossFloor ? 'text-foreground' : 'text-foreground'}`}>
              {isConquered ? 'Floor 1000 / 1000' : `Floor ${state.currentFloor} / 1000`}
            </h2>
            <div className="flex justify-center">
              {isConquered ? (
                <span className="px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase bg-surface-raised text-foreground text-muted border border-border/50">
                  CONQUERED
                </span>
              ) : (isMegaBossFloor || isBossFloor || isMiniBossFloor) && (
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase ${isMegaBossFloor ? 'bg-surface-raised text-foreground text-muted border border-border/50' : isBossFloor ? 'bg-surface-raised text-foreground text-muted border border-border/50' : 'bg-surface-raised text-foreground text-muted border border-border/50' }`}>
                  {isMegaBossFloor ? 'MEGA BOSS' : isBossFloor ? 'BOSS' : 'MINI BOSS'}
                </span>
              )}
            </div>
            {!isConquered && data?.floorCp && (
              <div className="mt-3">
                <span className="text-xs font-bold text-muted bg-surface-raised px-3 py-1 rounded-full border border-border">
                  Floor CP: <strong className="text-foreground">{data.floorCp.toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>

          {isConquered ? (
            <div className="w-full flex-1 bg-surface border border-border rounded-2xl p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-surface-raised rounded-2xl flex items-center justify-center mb-4 border border-border">
                <Mountain className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-1">
                Infinity Tower Conquered!
              </h3>
              <p className="text-xs sm:text-sm text-muted max-w-md">
                You have scaled the highest peak of the Infinity Tower and cleared all 1000 floors.
              </p>
            </div>
          ) : activeEncounter ? (
            <div className="w-full flex-1 bg-surface border border-border rounded-2xl p-5 sm:p-8 shadow-xs relative overflow-hidden flex flex-col items-center justify-center min-h-[350px]">
              <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 w-full">
                  {(activeEncounter.enemyTeam as OwnedPokemonDto[]).map((pokemon: OwnedPokemonDto, index: number) => (
                    <div key={index} className="group flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface-raised rounded-2xl flex items-center justify-center mb-2.5 border border-border shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-md relative overflow-hidden">
                        <img
                          src={`https://res.cloudinary.com/d0baluu2/image/upload/astranox/pokemon/${pokemon.species?.id}.png`}
                          alt={pokemon.species?.name}
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

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-raised border border-border rounded-xl p-3.5 max-w-xl mx-auto">
                  {/* Coins */}
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-xs border border-border shrink-0">
                      <img src="/infinity.webp" alt="Infinity Coins" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black text-muted uppercase tracking-wider">Coins</span>
                      <span className="text-base sm:text-lg font-black text-foreground leading-none">
                        +{(activeEncounter.reward as { infinityCoins?: number })?.infinityCoins || 0}
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-3 justify-center sm:border-l border-border py-2 sm:py-0">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-xs border border-border shrink-0">
                      <img src="/xp.webp" alt="Stored XP" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black text-muted uppercase tracking-wider">Stored XP</span>
                      <span className="text-base sm:text-lg font-black text-foreground leading-none">
                        +{(activeEncounter.reward as { storedXp?: number })?.storedXp || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {data.floorCp && data.playerCp && data.floorCp < data.playerCp * 0.1 ? (
                  <button
                    onClick={handleSkipFloors}
                    disabled={skipFloors.isPending}
                    className="w-full sm:w-auto bg-primary text-primary-foreground font-black py-3.5 px-10 rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation select-none"
                  >
                    {skipFloors.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FastForward className="w-5 h-5" />}
                    {skipFloors.isPending ? 'Skipping...' : 'Skip Floors'}
                  </button>
                ) : (
                  <button
                    onClick={handleStartBattle}
                    disabled={startBattle.isPending}
                    className="w-full sm:w-auto bg-primary text-primary-foreground font-black py-3.5 px-10 rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation select-none"
                  >
                    {startBattle.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
                    {startBattle.isPending ? 'Preparing...' : 'Start Battle'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full bg-surface border border-border rounded-2xl p-8 flex flex-col items-center shadow-xs">
              <Loader2 className="w-10 h-10 text-foreground animate-spin mb-3" />
              <p className="text-muted text-sm font-medium">Generating Enemy...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
