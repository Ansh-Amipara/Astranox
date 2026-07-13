import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../services/api';
import { useNavigate } from 'react-router-dom';

const typeColors: Record<string, string> = {
  normal: 'bg-stone-400 text-white',
  fire: 'bg-red-500 text-white',
  water: 'bg-blue-500 text-white',
  electric: 'bg-yellow-400 text-slate-900',
  grass: 'bg-green-500 text-white',
  ice: 'bg-cyan-300 text-slate-900',
  fighting: 'bg-orange-700 text-white',
  poison: 'bg-purple-500 text-white',
  ground: 'bg-amber-600 text-white',
  flying: 'bg-indigo-300 text-slate-900',
  psychic: 'bg-pink-500 text-white',
  bug: 'bg-lime-500 text-slate-900',
  rock: 'bg-yellow-700 text-white',
  ghost: 'bg-violet-700 text-white',
  dragon: 'bg-indigo-600 text-white',
  dark: 'bg-stone-800 text-white',
  steel: 'bg-slate-400 text-white',
};

export function BattleScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menu, setMenu] = useState<'main' | 'fight' | 'bag' | 'party'>('main');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch Trainer Save to get inventory
  const { data: trainerSave } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    }
  });

  const { data: battleRes, isLoading, error } = useQuery({
    queryKey: ['activeBattle'],
    queryFn: async () => {
      const { data } = await api.get('/battles/active');
      return data.data;
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const turnMutation = useMutation({
    mutationFn: async (action: string) => {
      const { data } = await api.post('/battles/turn', { action });
      return data.data;
    },
    onSuccess: (updatedTurnData) => {
      queryClient.setQueryData(['activeBattle'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: updatedTurnData.status,
          turnNumber: updatedTurnData.turnNumber + 1,
          playerPokemonData: updatedTurnData.p1State,
          opponentPokemonData: updatedTurnData.p2State,
          log: [...(old.log || []), { turn: updatedTurnData.turnNumber, events: updatedTurnData.events }]
        };
      });
      setMenu('main');
    }
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Battle...</div>;
  
  if (error || !battleRes) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white gap-4 transition-colors duration-200">
        <p>No active battle found.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors">Return</button>
      </div>
    );
  }

  const wild = battleRes.opponentPokemonData;
  const opponentPartyData = battleRes.opponentPartyData || [];
  const player = battleRes.playerPokemonData;
  const playerPartyData = battleRes.playerPartyData || [];
  const status = battleRes.status;
  const battleType = battleRes.battleType || 'WILD';
  const isFinished = status === 'WON' || status === 'LOST' || status === 'FLED' || status === 'CAUGHT';
  const isWaitingSwitch = status === 'WAITING_SWITCH';
  
  // Last events logic to show what happened
  const log = battleRes.log || [];
  const lastTurnLog = log.find((l: any) => l.turn === battleRes.turnNumber - 1);
  const rawEvents = lastTurnLog ? lastTurnLog.events : [];
  
  const getEventMessage = (ev: any) => {
    const name = ev.pokemonId === player.id ? player.speciesName : wild.speciesName;
    switch (ev.type) {
      case 'move': return `${name} used ${ev.moveName}!`;
      case 'damage': return ev.effectiveness > 1 ? "It's super effective!" : ev.effectiveness < 1 ? "It's not very effective..." : null;
      case 'miss': return `${name}'s attack missed!`;
      case 'faint': return `${name} fainted!`;
      case 'status_inflicted': return `${name} got ${ev.status}!`;
      case 'status_effect': return ev.message || null;
      case 'status_cleared': return `${name} recovered!`;
      case 'switch': return ev.isPlayer ? `You sent out ${ev.name}!` : `Foe sent out ${ev.name}!`;
      case 'xp_gain': return `${name} gained ${ev.amount} Exp. Points!`;
      case 'level_up': return `${name} grew to Lv. ${ev.level}!`;
      case 'fled': return "Got away safely!";
      case 'catch_attempt': 
        if (ev.success) {
          return `Gotcha! ${wild.speciesName} was caught!`;
        } else {
          if (ev.shakes === 0) return `Oh no! The Pokémon broke free!`;
          if (ev.shakes === 1) return `Aww! It appeared to be caught!`;
          if (ev.shakes === 2) return `Aargh! Almost had it!`;
          if (ev.shakes === 3) return `Shoot! It was so close too!`;
          return `The Pokémon broke free!`;
        }
      default: return null;
    }
  };

  const lastTurnEvents = rawEvents.map(getEventMessage).filter(Boolean);

  return (
    <div className="relative h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-row overflow-hidden">
      {/* Left Column: Arena and Action Menu */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Removed old Unsplash background layer to avoid conflict with the new battle-bg.png */}
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 z-[100] shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Main Arena */}
      <div 
        className="relative z-10 flex-1 flex flex-col justify-between p-4 bg-cover bg-center bg-no-repeat min-h-0 overflow-hidden"
        style={{ backgroundImage: "url('/battle-bg.png')" }}
      >
        
        {/* Top Half: Wild Pokemon */}
        <div className="flex justify-end w-full max-w-5xl mx-auto mt-2 relative shrink-0">
          
          {/* Wild Sprite */}
          <div className="absolute right-[200px] top-12">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/30 dark:bg-black/50 blur-xl rounded-full"></div>
            <img 
              src={getSpriteUrl(wild.speciesId)}
              className="relative w-64 h-64 object-contain animate-bounce"
              style={{ imageRendering: 'pixelated' }}
              alt={wild.speciesName}
            />
          </div>

          {/* Wild Info Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl w-80 mb-4 z-10">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize tracking-wide">{wild.speciesName}</h2>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-300">Lv {wild.level}</span>
            </div>
            
            {/* Enemy Party Indicators (NPC only) */}
            {battleType === 'NPC' && opponentPartyData.length > 0 && (
              <div className="flex gap-1 mb-2">
                {opponentPartyData.map((p: any) => (
                  <div 
                    key={p.id} 
                    className={`w-3 h-3 rounded-full ${p.currentHp > 0 ? 'bg-red-500' : 'bg-slate-400 dark:bg-slate-700'}`} 
                    title={p.currentHp > 0 ? 'Healthy' : 'Fainted'}
                  ></div>
                ))}
              </div>
            )}
            
            {/* HP Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 border-2 border-slate-300 dark:border-slate-900 overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-500 ${wild.currentHp / wild.maxHp > 0.5 ? 'bg-green-500' : wild.currentHp / wild.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.max(0, (wild.currentHp / wild.maxHp) * 100)}%` }}
                ></div>
            </div>
            <div className="text-right mt-1 text-xs text-slate-500 dark:text-slate-400 font-bold">
              {wild.currentHp} / {wild.maxHp}
            </div>
          </div>
        </div>

        {/* Spacer to push player to bottom */}
        <div className="flex-1"></div>

        {/* Bottom Half: Player Pokemon */}
        <div className="flex justify-start w-full max-w-5xl mx-auto mb-2 shrink-0">
          <div className="relative inline-block mt-4 ml-[200px] -translate-y-8">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/30 dark:bg-black/50 blur-xl rounded-full"></div>
            <img 
              src={getSpriteUrl(player.speciesId)}
              className="relative w-64 h-64 object-contain"
              style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }}
              alt={player.speciesName}
            />
          </div>
          
          {/* Player Info Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl w-80 ml-12 self-end">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize tracking-wide drop-shadow-sm">
                {player.nickname || player.speciesName}
              </h3>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Lv{player.level}
              </span>

            </div>
            
            {/* HP Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 border-2 border-slate-300 dark:border-slate-900 overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-500 ${player.currentHp / player.maxHp > 0.5 ? 'bg-green-500' : player.currentHp / player.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.max(0, (player.currentHp / player.maxHp) * 100)}%` }}
                ></div>
            </div>
            <div className="text-right mt-1 text-xs text-slate-500 dark:text-slate-400 font-bold">
              {player.currentHp} / {player.maxHp}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom UI Console */}
      <div className="bg-slate-100 dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 transition-colors duration-200 shrink-0">
        <div className="w-full h-24">
          {/* Action Menu Box */}
          <div className="h-full bg-slate-200 dark:bg-slate-900 rounded-xl p-4 flex flex-col transition-colors duration-200">
            {battleRes.status === 'WAITING_MOVE_LEARN' ? (
              <div className="flex flex-col h-full w-full justify-center">
                <div className="text-center font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {player.nickname || player.speciesName} is trying to learn <span className="text-blue-500 uppercase">{rawEvents.find((e: any) => e.type === 'prompt_learn_move')?.moveName || 'a new move'}</span>. Which move should be forgotten?
                </div>
                <div className="flex flex-row gap-2 h-full w-full">
                  {(player.moves || []).map((move: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => turnMutation.mutate(`learn_move:${i}`)}
                      disabled={turnMutation.isPending}
                      className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold text-lg rounded-lg border-2 border-slate-300 dark:border-slate-600 capitalize shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-red-500 text-xs">Forget</span>
                      <span>{(move.name || move.move?.name || 'Unknown').replace('-', ' ')}</span>
                    </button>
                  ))}
                  <div className="w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>
                  <button 
                    onClick={() => turnMutation.mutate('skip_move')}
                    disabled={turnMutation.isPending}
                    className="w-32 bg-slate-400 hover:bg-slate-500 text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (!isFinished || isWaitingSwitch) && (
              <div className="flex flex-col h-full">
                  <div className="flex flex-row gap-2 h-full w-full">
                    {/* Moves */}
                    {(player.moves || []).map((move: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => turnMutation.mutate(`move:${move.moveId}`)}
                        disabled={turnMutation.isPending}
                        className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold text-lg rounded-lg border-2 border-slate-300 dark:border-slate-600 capitalize shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                      >
                        <span>{(move.name || move.move?.name || 'Unknown').replace('-', ' ')}</span>
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${typeColors[move.type?.toLowerCase()] || typeColors.normal}`}>
                          {move.type || 'Normal'}
                        </span>
                      </button>
                    ))}
                    {/* Fill empty move slots */}
                    {Array.from({ length: Math.max(0, 4 - (player.moves?.length || 0)) }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 bg-slate-300 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-700 rounded-lg"></div>
                    ))}

                    {/* Divider */}
                    <div className="w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>

                    {/* Utility Icons */}
                    <button 
                      onClick={() => {
                        if (battleType === 'NPC') {
                          showToast("You can't catch other trainers' Pokémon!");
                        } else {
                          setMenu('bag');
                        }
                      }}
                      title="Bag"
                      className={`w-20 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 ${battleType === 'NPC' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                      Bag
                    </button>
                    <button 
                      onClick={() => setMenu('party')}
                      title="Pokémon"
                      className="w-20 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5"
                    >
                      Pkmn
                    </button>
                    <button 
                      onClick={() => turnMutation.mutate('run')}
                      disabled={turnMutation.isPending}
                      title="Run"
                      className="w-20 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      Run
                    </button>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Right Column: Battle Log Sidebar */}
      <div className="w-1/5 bg-white dark:bg-slate-900 border-l border-slate-300 dark:border-slate-800 p-6 font-mono shadow-[-10px_0_40px_rgba(0,0,0,0.05)] dark:shadow-[-10px_0_40px_rgba(0,0,0,0.3)] transition-colors duration-200 flex flex-col z-20 h-full overflow-hidden">
        <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 shrink-0">Battle Log</h3>
        <div className="flex-1 flex flex-col overflow-y-auto min-h-0 no-scrollbar">
          <div className="flex flex-col space-y-2 pb-8">
            {lastTurnEvents.length > 0 ? (
              lastTurnEvents.map((msg: string, i: number) => (
                <p key={i} className="text-lg text-slate-800 dark:text-white mb-2 leading-relaxed capitalize">
                  {msg}
                </p>
              ))
            ) : (
              <p className="text-lg text-slate-800 dark:text-white animate-pulse">
                {status === 'WAITING_SWITCH' || status === 'WAITING_MOVE_LEARN' ? 'Waiting for your action...' : 'What will you do?'}
              </p>
            )}
          </div>
        </div>
      </div>


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

      {/* Battle Finished Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full max-w-md flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-wide uppercase text-center">
              Battle Finished!
            </h2>

            {/* Event List */}
            {lastTurnEvents.length > 0 && (
              <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {lastTurnEvents.map((msg: string, i: number) => (
                  <p key={i} className="text-center font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {msg}
                  </p>
                ))}
              </div>
            )}

            <div className={`w-full py-4 px-6 rounded-xl mb-8 border font-bold text-center text-lg ${
              status === 'WON' || status === 'CAUGHT' 
                ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : status === 'FLED' 
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                : 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              {status === 'WON' ? (battleType === 'NPC' ? 'You defeated the opposing Trainer!' : `You defeated the wild ${wild.speciesName}!`) : 
               status === 'CAUGHT' ? `Gotcha! ${wild.speciesName} was caught!` :
               status === 'FLED' ? 'Got away safely!' : 'Better luck next time!'}
            </div>

            <button 
              onClick={() => {
                queryClient.setQueryData(['activeBattle'], null);
                navigate('/');
              }} 
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
