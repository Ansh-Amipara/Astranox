import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

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
    retry: false
  });

  const turnMutation = useMutation({
    mutationFn: async (action: string) => {
      const { data } = await api.post('/battles/turn', { action });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeBattle'] });
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
        <button onClick={() => navigate('/map')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors">Return to Map</button>
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
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col overflow-hidden">
      {/* Dynamic Background Image based on Zone */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518002171953-a080ee817e1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-60 dark:opacity-30 pointer-events-none z-0"></div>
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 z-[100] shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Main Arena */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-8">
        
        {/* Top Half: Wild Pokemon */}
        <div className="flex justify-end w-full max-w-5xl mx-auto mt-12">
          {/* Wild Info Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl w-80 mb-4">
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
        <div className="flex justify-start w-full max-w-5xl mx-auto mb-12">
          <div className="relative inline-block mt-24">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/30 dark:bg-black/50 blur-xl rounded-full"></div>
            <img 
              src={`http://localhost:3000/sprites/back/${player.speciesId}.png`}
              className="relative w-64 h-64 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          {/* Player Info Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl w-80 ml-12 self-end">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize tracking-wide">{player.nickname || player.speciesName}</h2>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-300">Lv {player.level}</span>
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
      <div className="bg-slate-100 dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 transition-colors duration-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 h-48">
          
          {/* Battle Log Box */}
          <div className="bg-white dark:bg-black/40 rounded-xl border border-slate-300 dark:border-slate-800 p-4 font-mono overflow-y-auto shadow-inner transition-colors duration-200">
            {isFinished ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p className="text-xl text-slate-900 dark:text-white font-bold capitalize">Battle Finished!</p>
                <p className="text-slate-800 dark:text-slate-200">
                  {status === 'WON' ? (battleType === 'NPC' ? 'You defeated the opposing Trainer!' : `You defeated the wild ${wild.speciesName}!`) : 
                   status === 'CAUGHT' ? `Gotcha! ${wild.speciesName} was caught!` :
                   status === 'FLED' ? 'Got away safely!' : 'You blacked out!'}
                </p>
                <button 
                  onClick={() => navigate('/map')} 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
                >
                  Leave Battle
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-end min-h-full">
                {lastTurnEvents.length > 0 ? (
                  lastTurnEvents.map((msg: string, i: number) => (
                    <p key={i} className="text-lg text-slate-800 dark:text-white mb-2 leading-relaxed capitalize">
                      {msg}
                    </p>
                  ))
                ) : (
                  <p className="text-lg text-slate-800 dark:text-white animate-pulse">
                    What will <span className="font-bold capitalize text-blue-600 dark:text-blue-400">{player.nickname || player.speciesName}</span> do?
                  </p>
                )}
                {isWaitingSwitch && (
                  <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-2">
                    Choose a Pokémon to send out!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Menu Box */}
          <div className="bg-slate-200 dark:bg-slate-900 rounded-xl p-4 flex flex-col transition-colors duration-200">
            {(!isFinished || isWaitingSwitch) && (
              <div className="h-full">
                {menu === 'main' && (
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <button 
                      onClick={() => setMenu('fight')}
                      className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black text-2xl rounded-lg shadow-lg hover:shadow-red-500/50 transition-all hover:-translate-y-1"
                    >
                      FIGHT
                    </button>
                    <button 
                      onClick={() => {
                        if (battleType === 'NPC') {
                          showToast("You can't catch other trainers' Pokémon!");
                        } else {
                          setMenu('bag');
                        }
                      }}
                      className={`bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-black text-2xl rounded-lg shadow-lg hover:shadow-yellow-500/50 transition-all hover:-translate-y-1 ${battleType === 'NPC' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                      BAG
                    </button>
                    <button 
                      onClick={() => setMenu('party')}
                      className="bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-black text-2xl rounded-lg shadow-lg hover:shadow-green-500/50 transition-all hover:-translate-y-1"
                    >
                      POKéMON
                    </button>
                    <button 
                      onClick={() => turnMutation.mutate('FLED')}
                      disabled={turnMutation.isPending}
                      className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-black text-2xl rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all hover:-translate-y-1 disabled:opacity-50"
                    >
                      RUN
                    </button>
                  </div>
                )}

                {menu === 'fight' && (
                  <div className="flex flex-col h-full gap-2">
                    <button 
                      onClick={() => setMenu('main')}
                      className="self-start text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold mb-2 flex items-center transition-colors"
                    >
                      ← Back
                    </button>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {(player.moves || []).map((moveName: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => turnMutation.mutate(`move:${moveName}`)}
                          disabled={turnMutation.isPending}
                          className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold text-xl rounded-lg border-2 border-slate-300 dark:border-slate-600 capitalize shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                          {moveName}
                        </button>
                      ))}
                      {/* Fill empty move slots */}
                      {Array.from({ length: Math.max(0, 4 - (player.moves?.length || 0)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-300 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-700 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                )}

                {menu === 'bag' && (
                  <div className="flex flex-col h-full gap-2">
                    <button 
                      onClick={() => setMenu('main')}
                      className="self-start text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold mb-2 flex items-center transition-colors"
                    >
                      ← Back
                    </button>
                    <div className="flex-1 overflow-y-auto">
                      {trainerSave?.inventory?.filter((inv: any) => inv.item.name.includes('ball') && inv.quantity > 0).length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {trainerSave.inventory
                            .filter((inv: any) => inv.item.name.includes('ball') && inv.quantity > 0)
                            .map((inv: any) => (
                              <button
                                key={inv.itemId}
                                onClick={() => turnMutation.mutate(`item:${inv.item.name}`)}
                                disabled={turnMutation.isPending}
                                className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center gap-2 p-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
                              >
                                {inv.item.spriteUrl && <img src={inv.item.spriteUrl} alt={inv.item.name} className="w-8 h-8 object-contain drop-shadow" />}
                                <div className="flex flex-col items-start">
                                  <span className="font-bold text-slate-900 dark:text-white capitalize text-sm">{inv.item.name.replace('-', ' ')}</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">x{inv.quantity}</span>
                                </div>
                              </button>
                            ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                          You have no Pokéballs.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {menu === 'party' && (
                  <div className="flex flex-col h-full gap-2">
                    {!isWaitingSwitch && (
                      <button 
                        onClick={() => setMenu('main')}
                        className="self-start text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold mb-2 flex items-center transition-colors"
                      >
                        ← Back
                      </button>
                    )}
                    <div className="flex-1 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
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
                              }}
                              disabled={turnMutation.isPending || isActive || isFainted}
                              className={`flex flex-col items-start p-2 rounded-lg border-2 shadow-sm transition-all text-left ${isActive ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-600' : isFainted ? 'bg-slate-200 border-slate-300 opacity-50 dark:bg-slate-800 dark:border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 hover:-translate-y-0.5'}`}
                            >
                              <div className="flex items-center gap-2 mb-1 w-full justify-between">
                                <span className="font-bold text-slate-900 dark:text-white capitalize text-sm">{p.name || p.speciesName}</span>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Lv {p.level}</span>
                              </div>
                              <div className="w-full bg-slate-300 dark:bg-slate-900 rounded-full h-2 overflow-hidden relative">
                                <div 
                                  className={`h-full ${p.currentHp / p.maxHp > 0.5 ? 'bg-green-500' : p.currentHp / p.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                  style={{ width: `${Math.max(0, (p.currentHp / p.maxHp) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs mt-1 text-slate-600 dark:text-slate-400">{p.currentHp} / {p.maxHp} HP</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
