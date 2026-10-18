import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBattleSession } from '@/features/battle/hooks/useBattleSession';
import { BattleScreenPresenter } from './BattleScreenPresenter';
import { Skeleton, EmptyState, ErrorState, Button } from '@/components/ui';
import { getSpriteUrl } from '@/lib/axios';
import { preloadSprites } from '@/lib/sprite';

export function BattleScreen() {
  const navigate = useNavigate();

  const [menu, setMenu] = useState<'main' | 'fight' | 'bag' | 'party'>('main');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const {
    trainerSave,
    battleRes,
    isLoading,
    error,
    turnMutation,
    lastTurnEvents,
    rawEvents,
    isFinished,
    isWaitingSwitch,
  } = useBattleSession();

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  useEffect(() => {
    if (isWaitingSwitch && !isFinished) {
      setMenu('party');
    }
  }, [isWaitingSwitch, isFinished]);

  // Preload battle sprites once session is established
  useEffect(() => {
    if (battleRes) {
      const spriteUrls: (string | null | undefined)[] = [
        battleRes.playerPokemonData?.species?.id
          ? getSpriteUrl(battleRes.playerPokemonData.species.id)
          : null,
        battleRes.opponentPokemonData?.species?.id
          ? getSpriteUrl(battleRes.opponentPokemonData.species.id)
          : null,
        ...(battleRes.playerPartyData || []).map((p: any) =>
          p?.species?.id ? getSpriteUrl(p.species.id) : null
        ),
        ...(battleRes.opponentPartyData || []).map((p: any) =>
          p?.species?.id ? getSpriteUrl(p.species.id) : null
        ),
      ];
      preloadSprites(spriteUrls);
    }
  }, [battleRes]);

  const battleType = battleRes?.battleType || 'WILD';

  const handleMoveSelect = useCallback((action: string) => {
    turnMutation.mutate(action);
    setMenu('main');
  }, [turnMutation]);

  const handleSkipMove = useCallback(() => {
    turnMutation.mutate('skip_move');
    setMenu('main');
  }, [turnMutation]);

  const handleRun = useCallback(() => {
    turnMutation.mutate('run');
    setMenu('main');
  }, [turnMutation]);

  const handleOpenBag = useCallback(() => {
    setMenu('bag');
  }, []);

  const handleOpenParty = useCallback(() => {
    setMenu('party');
  }, []);

  const [searchParams] = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/';
  const arenaTrainerId = searchParams?.get('arenaTrainerId') || null;

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 text-foreground">
        <div className="w-full max-w-4xl bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-8">
          {/* Opponent HUD Skeleton */}
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-48">
              <Skeleton width={140} height={20} />
              <Skeleton width="100%" height={10} className="rounded-full" />
            </div>
            <Skeleton variant="circular" width={80} height={80} />
          </div>

          {/* Arena Center Placeholder */}
          <div className="h-40 flex items-center justify-center">
            <div className="text-xs font-bold text-muted animate-pulse">Initializing Battle Session...</div>
          </div>

          {/* Player HUD Skeleton */}
          <div className="flex justify-between items-end">
            <Skeleton variant="circular" width={80} height={80} />
            <div className="space-y-2 w-48 text-right">
              <Skeleton width={140} height={20} className="ml-auto" />
              <Skeleton width="100%" height={10} className="rounded-full" />
            </div>
          </div>

          {/* Action Menu Skeleton */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
            <Skeleton height={48} className="rounded-xl" />
            <Skeleton height={48} className="rounded-xl" />
            <Skeleton height={48} className="rounded-xl" />
            <Skeleton height={48} className="rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
        <ErrorState
          title="Battle Connection Error"
          message={(error as Error)?.message || 'Failed to communicate with the battle engine.'}
          onRetry={() => window.location.reload()}
          retryLabel="Reconnect Battle"
        />
      </div>
    );
  }

  if (!battleRes) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
        <EmptyState
          title="No Active Battle"
          description="You currently do not have an active encounter or battle session."
          action={
            <Button
              variant="outline"
              onClick={() => navigate(returnUrl)}
              className="font-bold"
            >
              Return to Overworld
            </Button>
          }
        />
      </div>
    );
  }

  const wild = battleRes.opponentPokemonData;
  const opponentPartyData = battleRes.opponentPartyData || [];
  const player = battleRes.playerPokemonData;
  const playerPartyData = battleRes.playerPartyData || [];
  const status = battleRes.status;



  return (
    <BattleScreenPresenter 
      menu={menu}
      setMenu={setMenu}
      toastMsg={toastMsg}
      showToast={showToast}
      trainerSave={trainerSave}
      wild={wild}
      opponentPartyData={opponentPartyData}
      player={player}
      playerPartyData={playerPartyData}
      status={status}
      rawEvents={rawEvents}
      lastTurnEvents={lastTurnEvents}
      isFinished={isFinished}
      isWaitingSwitch={isWaitingSwitch}
      isPending={turnMutation.isPending}
      battleType={battleType}
      returnUrl={returnUrl}
      arenaTrainerId={arenaTrainerId}
      onMoveSelect={handleMoveSelect}
      onSkipMove={handleSkipMove}
      onRun={handleRun}
      onOpenBag={handleOpenBag}
      onOpenParty={handleOpenParty}
      onSwitch={(id: string) => turnMutation.mutate(`switch:${id}`)}
      onUseItem={(itemId: string) => turnMutation.mutate(`item:${itemId}`)}
    />
  );
}
