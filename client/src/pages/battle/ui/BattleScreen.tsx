import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBattleSession } from '../../../features/battle/model/useBattleSession';
import { BattleArena } from '../../../features/battle/ui/BattleArena';
import { BattleControls } from '../../../features/battle/ui/BattleControls';
import { BattleLog } from '../../../features/battle/ui/BattleLog';
import { BattleResultModal } from '../../../features/battle/ui/BattleResultModal';

export function BattleScreen() {
  const navigate = useNavigate();
  const location = useLocation();
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
    if (battleType === 'NPC') {
      showToast("You can't catch other trainers' Pokémon!");
    } else {
      setMenu('bag');
    }
  }, [battleType, showToast]);

  const handleOpenParty = useCallback(() => {
    setMenu('party');
  }, []);

  if (isLoading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Battle...</div>;
  
  const returnUrl = location.state?.returnUrl || '/';

  if (error || !battleRes) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white gap-4 transition-colors duration-200">
        <p>No active battle found.</p>
        <button onClick={() => navigate(returnUrl)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors">Return</button>
      </div>
    );
  }

  const wild = battleRes.opponentPokemonData;
  const opponentPartyData = battleRes.opponentPartyData || [];
  const player = battleRes.playerPokemonData;
  const playerPartyData = battleRes.playerPartyData || [];
  const status = battleRes.status;



  return (
    <div className="relative h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-row overflow-hidden">
      {/* Left Column: Arena and Action Menu */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 z-[100] shadow-xl">
            {toastMsg}
          </div>
        )}

        <BattleArena 
          wild={wild}
          player={player}
          opponentPartyData={opponentPartyData}
          battleType={battleType}
        />

        <BattleControls 
          player={player}
          status={status}
          battleType={battleType}
          rawEvents={rawEvents}
          isPending={turnMutation.isPending}
          isFinished={isFinished}
          isWaitingSwitch={isWaitingSwitch}
          onMoveSelect={handleMoveSelect}
          onSkipMove={handleSkipMove}
          onRun={handleRun}
          onOpenBag={handleOpenBag}
          onOpenParty={handleOpenParty}
        />
      </div>

      <BattleLog 
        lastTurnEvents={lastTurnEvents}
        status={status}
      />

      {/* Modal Overlays for Bag & Party */}
      {(menu === 'bag' || menu === 'party') && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isWaitingSwitch) {
              setMenu('main');
            }
          }}
        >
          <div className="bg-slate-100 dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-700 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-300 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">{menu === 'bag' ? 'Bag' : 'Pokémon Party'}</h2>
              {!isWaitingSwitch && (
                <button onClick={() => setMenu('main')} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors px-2 text-3xl leading-none">&times;</button>
              )}
            </div>
            <div className="p-6 overflow-y-auto">
              {menu === 'bag' && (
                trainerSave?.inventory?.filter((inv: any) => inv.itemId.endsWith('ball') && inv.quantity > 0).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {trainerSave.inventory
                      .filter((inv: any) => inv.itemId.endsWith('ball') && inv.quantity > 0)
                      .map((inv: any) => (
                        <button
                          key={inv.itemId}
                          onClick={() => { turnMutation.mutate(`item:${inv.itemId}`); setMenu('main'); }}
                          disabled={turnMutation.isPending}
                          className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center gap-3 p-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                          {inv.item.spriteUrl && <img src={inv.item.spriteUrl} alt={inv.item.name} className="w-10 h-10 object-contain drop-shadow" />}
                          <div className="flex flex-col items-start">
                            <span className="font-bold text-slate-900 dark:text-white capitalize">{inv.item.name.replace('-', ' ')}</span>
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">x{inv.quantity}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="p-8 flex items-center justify-center text-xl text-slate-500 dark:text-slate-400 font-bold">
                    You have no Pokéballs.
                  </div>
                )
              )}

              {menu === 'party' && (
                <div className="grid grid-cols-1 gap-4">
                  {playerPartyData.map((p: any) => {
                    const isActive = p.id === player.id;
                    const isFainted = p.currentHp <= 0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (isActive) {
                            showToast(`${p.name || p.speciesName} is already in battle!`);
                            return;
                          }
                          if (isFainted) {
                            showToast(`${p.name || p.speciesName} has no energy left to battle!`);
                            return;
                          }
                          turnMutation.mutate(`switch:${p.id}`);
                          setMenu('main');
                        }}
                        disabled={turnMutation.isPending || isActive || isFainted}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 shadow-sm transition-all text-left ${isActive ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-600' : isFainted ? 'bg-slate-200 border-slate-300 opacity-50 dark:bg-slate-800 dark:border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 hover:-translate-y-0.5'}`}
                      >
                        <div className="flex items-center gap-3 mb-2 w-full justify-between">
                          <span className="font-bold text-slate-900 dark:text-white capitalize text-lg">{p.name || p.speciesName}</span>
                          <span className="text-sm font-black text-slate-500 dark:text-slate-300">Lv {p.level}</span>
                        </div>
                        <div className="w-full bg-slate-300 dark:bg-slate-950 rounded-full h-3 overflow-hidden relative border border-slate-400 dark:border-slate-900">
                          <div 
                            className={`h-full ${p.currentHp / p.maxHp > 0.5 ? 'bg-green-500' : p.currentHp / p.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.max(0, (p.currentHp / p.maxHp) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold mt-2 text-slate-600 dark:text-slate-400">{p.currentHp} / {p.maxHp} HP</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BattleResultModal 
        isFinished={isFinished}
        status={status}
        battleType={battleType}
        lastTurnEvents={lastTurnEvents}
        wildSpeciesName={wild.speciesName}
      />
    </div>
  );
}
