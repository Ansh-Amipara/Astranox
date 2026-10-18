import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useExploreStore } from './store';
import { useExploreSocket } from './hooks/useExploreSocket';
import { useKeyboardMovement } from './hooks/useKeyboardMovement';
import { MapView } from './components/MapView';
import { Dpad } from './components/Dpad';
import { EncounterTransition } from './components/EncounterTransition';
import { BattleScreen } from './components/BattleScreen';
import { OutcomeDialog } from './components/OutcomeDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { preloadSprites } from '@/lib/sprite';
import { getSpriteUrl } from '@/lib/axios';
import { AlertCircle } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    mapId,
    playerPos,
    activeBattle,
    battleEvents,
    isEncounterTransition,
    finalOutcome,
    isLoadingMap,
    setEncounterTransition,
    setFinalOutcome,
    resetExplore,
  } = useExploreStore();

  const { isConnected, joinExplore, sendMove, sendBattleAction } = useExploreSocket();

  // Load Trainer Save
  const {
    data: trainerSave,
    isLoading: isTrainerLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  // Re-join explore on mount or connection restore
  useEffect(() => {
    if (isConnected) {
      joinExplore();
    }
  }, [isConnected, joinExplore]);

  // Preload battle sprites when encounter starts
  useEffect(() => {
    if (activeBattle) {
      const urls: string[] = [];
      if (activeBattle.wildPokemon?.speciesId) {
        urls.push(getSpriteUrl(activeBattle.wildPokemon.speciesId));
      }
      if (activeBattle.playerActive?.speciesId) {
        urls.push(getSpriteUrl(activeBattle.playerActive.speciesId));
      }
      for (const p of activeBattle.playerParty || []) {
        if (p.speciesId) urls.push(getSpriteUrl(p.speciesId));
      }
      if (urls.length > 0) {
        preloadSprites(urls);
      }
    }
  }, [activeBattle]);

  // Check if player has conscious party Pokémon
  const party = trainerSave?.party || [];
  const hasHealthyPokemon =
    party.length === 0 ||
    party.some((p: any) => p.currentHp === undefined || p.currentHp > 0);

  // Hook up keyboard movement
  const isControlDisabled =
    !isConnected ||
    !hasHealthyPokemon ||
    !!activeBattle ||
    isEncounterTransition ||
    !!finalOutcome;

  useKeyboardMovement({
    onMove: sendMove,
    disabled: isControlDisabled,
  });

  const handleCloseOutcome = () => {
    setFinalOutcome(null);
    resetExplore();
    queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
  };

  // Screen States
  if (isTrainerLoading || isLoadingMap) {
    return (
      <div className="flex-1 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-xl flex flex-col items-center gap-4">
          <Skeleton className="w-full h-80 rounded-2xl" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-36 h-36 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-background">
        <ErrorState
          title="Failed to Load Exploration"
          message="Could not connect to the exploration server or load your trainer save."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-start p-4 bg-background select-none overflow-x-hidden">
      {!isConnected && <OfflineBanner />}

      {/* Screen reader instructions */}
      <div className="sr-only">
        Overworld 2D Exploration. Use Arrow Keys or W, A, S, D to move your trainer across the grid. Touch D-pad is available below for mobile controls.
      </div>

      {/* Warning banner if all Pokémon are fainted */}
      {!hasHealthyPokemon && (
        <div
          className="w-full max-w-xl mb-4 p-3.5 bg-surface border border-danger/40 text-danger rounded-2xl flex items-center gap-3 text-sm shadow-sm"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>All your Pokémon have fainted! Wild encounters are disabled until you heal your team.</span>
        </div>
      )}

      {/* Transition Wipe */}
      <EncounterTransition
        active={isEncounterTransition}
        onComplete={() => setEncounterTransition(false)}
      />

      {/* Active Battle Screen Overlay */}
      {activeBattle ? (
        <div className="w-full max-w-xl my-auto flex items-center justify-center">
          <BattleScreen
            battleState={activeBattle}
            events={battleEvents}
            inventory={trainerSave?.inventory || []}
            onAction={sendBattleAction}
            disabled={!isConnected}
          />
        </div>
      ) : (
        /* Overworld Exploration View */
        <div className="w-full max-w-xl flex flex-col items-center gap-4 my-auto">
          <MapView mapId={mapId} playerPos={playerPos} />

          {/* Touch D-Pad */}
          <div className="w-full flex items-center justify-center pt-2 pb-4">
            <Dpad onMove={sendMove} disabled={isControlDisabled} />
          </div>
        </div>
      )}

      {/* Terminal Outcome Modal */}
      {finalOutcome && (
        <OutcomeDialog outcomeResult={finalOutcome} onClose={handleCloseOutcome} />
      )}
    </div>
  );
};

export default ExplorePage;
