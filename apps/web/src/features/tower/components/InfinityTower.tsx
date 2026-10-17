import { useTowerState, useStartTowerFloor, useStartTowerBattle, useSkipTowerFloors } from '../hooks/useTower';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { toast } from 'sonner';
import { OwnedPokemonDto } from '@astranox/types';;

import { Loader2, Coins, AlertCircle, Mountain, Swords, FastForward } from 'lucide-react';

export const InfinityTowerPage: React.FC = () => {
  const { data, isLoading, error } = useTowerState();
  const startFloor = useStartTowerFloor();
  const startBattle = useStartTowerBattle();
  const skipFloors = useSkipTowerFloors();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: trainerSave } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-800/50 flex items-center gap-2">
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
          toast.error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to start battle');
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
            toast.success(
              `Skipped ${skipResult.skippedCount} floors (Floor ${skipResult.startFloor} ➔ ${skipResult.endFloor})! Rewards: +${skipResult.accumulatedCoins} Coins, +${skipResult.accumulatedXp} XP`
            );
          }
        },
        onError: (err: unknown) => {
          toast.error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to skip floors');
        }
      });
    }
  };

  const isConquered = state.currentFloor > 1000;
  const isBossFloor = !isConquered && state.currentFloor % 50 === 0 && state.currentFloor % 100 !== 0;
  const isMegaBossFloor = !isConquered && state.currentFloor % 100 === 0;
  const isMiniBossFloor = !isConquered && !isBossFloor && !isMegaBossFloor && state.currentFloor % 25 === 0;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">

        {/* Header Section */}
        <div className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                Infinity Tower
              </h1>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl flex flex-col md:flex-row items-center gap-4 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your CP: <span className="text-blue-500">{data?.playerCp?.toLocaleString() || 0}</span></span>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest Floor: {Math.min(1000, state.highestFloor)} / 1000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col py-2 px-0 md:px-4 w-full flex-1">

          <div className="text-center mb-6">
            <h2 className={`text-4xl font-black mb-2 tracking-tighter ${isMegaBossFloor ? 'text-red-600 dark:text-red-500' : isBossFloor ? 'text-orange-500 dark:text-orange-400' : isMiniBossFloor ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-800 dark:text-white'}`}>
              {isConquered ? 'Floor 1000 / 1000' : `Floor ${state.currentFloor} / 1000`}
            </h2>
            <div className="flex justify-center">
              {isConquered ? (
                <span className="px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                  CONQUERED
                </span>
              ) : (isMegaBossFloor || isBossFloor || isMiniBossFloor) && (
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase ${isMegaBossFloor ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50' :
                  isBossFloor ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50'
                  }`}>
                  {isMegaBossFloor ? 'MEGA BOSS' : isBossFloor ? 'BOSS' : 'MINI BOSS'}
                </span>
              )}
            </div>
            {!isConquered && data?.floorCp && (
              <div className="mt-3">
                <span className="text-sm font-bold text-slate-500 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  Floor CP: {data.floorCp.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {isConquered ? (
            <div className="w-full flex-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-500/50 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 border border-amber-300 dark:border-amber-700">
                <Mountain className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Infinity Tower Conquered!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                You have scaled the highest peak of the Infinity Tower and cleared all 1000 floors.
              </p>
            </div>
          ) : activeEncounter ? (
            <div className="w-full flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-8 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[350px]">
              {/* Decorative background element */}
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-700/30 dark:to-transparent pointer-events-none"></div>

              <div className="relative flex flex-col items-center w-full max-w-screen-2xl mx-auto">
                <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-8 w-full">
                  {(activeEncounter.enemyTeam as OwnedPokemonDto[]).map((pokemon: OwnedPokemonDto, index: number) => (
                    <div key={index} className="group flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-3 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-purple-300 dark:group-hover:border-purple-500/50 relative overflow-hidden">
                        <img
                          src={`https://res.cloudinary.com/d0baluu2/image/upload/astranox/pokemon/${pokemon.species?.id}.png`}
                          alt={pokemon.species?.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-white capitalize text-center leading-tight max-w-[100px] sm:max-w-[120px] break-words">
                        {pokemon.species?.name}
                      </span>
                      <span className="text-xs font-bold text-slate-500">Lv. {pokemon.level}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-8 max-w-3xl mx-auto shadow-inner">
                  
                  {/* Coins */}
                  <div className="flex items-center gap-4 justify-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shadow-sm border border-yellow-200/50 dark:border-yellow-800/50 shrink-0">
                      <img src="/infinity.png" alt="Infinity Coins" className="w-7 h-7 object-contain drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Coins</span>
                      <span className="text-xl font-black text-yellow-600 dark:text-yellow-400 leading-none">
                        +{(activeEncounter.reward as { infinityCoins?: number })?.infinityCoins || 0}
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-4 justify-center sm:border-l border-slate-200 dark:border-slate-700 py-4 sm:py-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shadow-sm border border-blue-200/50 dark:border-blue-800/50 shrink-0">
                      <img src="/xp.png" alt="Stored XP" className="w-7 h-7 object-contain drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Stored XP</span>
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400 leading-none">
                        +{(activeEncounter.reward as { storedXp?: number })?.storedXp || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {data.floorCp && data.playerCp && data.floorCp < data.playerCp * 0.1 ? (
                  <button
                    onClick={handleSkipFloors}
                    disabled={skipFloors.isPending}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-16 rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-3 text-xl"
                  >
                    {skipFloors.isPending ? <Loader2 className="w-7 h-7 animate-spin" /> : <FastForward className="w-7 h-7" />}
                    {skipFloors.isPending ? 'Skipping...' : 'Skip Floors'}
                  </button>
                ) : (
                  <button
                    onClick={handleStartBattle}
                    disabled={startBattle.isPending}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black py-5 px-16 rounded-2xl transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-3 text-xl"
                  >
                    {startBattle.isPending ? <Loader2 className="w-7 h-7 animate-spin" /> : <Swords className="w-7 h-7" />}
                    {startBattle.isPending ? 'Preparing...' : 'Start Battle'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center shadow-sm">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Generating Enemy...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
