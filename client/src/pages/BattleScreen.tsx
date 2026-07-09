import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function BattleScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menu, setMenu] = useState<'main' | 'fight'>('main');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  const wild = battleRes.wildPokemonData;
  const player = battleRes.playerPokemonData;
  const status = battleRes.status;
  const isFinished = status !== 'ACTIVE';
  
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
      case 'fled': return "Got away safely!";
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
            
            {/* HP Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 border-2 border-slate-300 dark:border-slate-900 overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-500 ${wild.currentHP / wild.maxHp > 0.5 ? 'bg-green-500' : wild.currentHP / wild.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.max(0, (wild.currentHP / wild.maxHp) * 100)}%` }}
                ></div>
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
                  className={`h-full transition-all duration-500 ${player.currentHP / player.maxHp > 0.5 ? 'bg-green-500' : player.currentHP / player.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.max(0, (player.currentHP / player.maxHp) * 100)}%` }}
                ></div>
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
                  {status === 'WON' ? `You defeated the wild ${wild.speciesName}!` : 
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
              </div>
            )}
          </div>

          {/* Action Menu Box */}
          <div className="bg-slate-200 dark:bg-slate-900 rounded-xl p-4 flex flex-col transition-colors duration-200">
            {!isFinished && (
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
                      onClick={() => showToast('Bag is a future feature!')}
                      className="bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 font-black text-2xl rounded-lg border-2 border-slate-400 dark:border-slate-700 cursor-not-allowed transition-colors"
                    >
                      BAG
                    </button>
                    <button 
                      onClick={() => showToast('Switching Pokémon is a future feature!')}
                      className="bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 font-black text-2xl rounded-lg border-2 border-slate-400 dark:border-slate-700 cursor-not-allowed transition-colors"
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
                      {(player.moves || [{ name: 'tackle' }]).map((move: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => turnMutation.mutate(move.name)}
                          disabled={turnMutation.isPending}
                          className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold text-xl rounded-lg border-2 border-slate-300 dark:border-slate-600 capitalize shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                          {move.name}
                        </button>
                      ))}
                      {/* Fill empty move slots */}
                      {Array.from({ length: Math.max(0, 4 - (player.moves?.length || 1)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-300 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-700 rounded-lg"></div>
                      ))}
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
