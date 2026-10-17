import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBattleSession } from '@/features/battle/hooks/useBattleSession';
import { api } from '@/shared/api/api';
import { BattleScreenPresenter } from './BattleScreenPresenter';

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

  if (isLoading) return <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Battle...</div>;

  if (error || !battleRes) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white gap-4 transition-colors duration-200 p-6 text-center">
        <h2 className="text-2xl font-black">No Active Battle</h2>
        <p className="text-slate-500 max-w-sm text-sm">You currently do not have an ongoing battle session. Start a new encounter below!</p>
        <div className="flex gap-3">
          <button onClick={() => navigate(returnUrl)} className="px-5 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors">
            Return
          </button>
        </div>
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
