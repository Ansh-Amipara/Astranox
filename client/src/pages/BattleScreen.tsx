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
    onSuccess: (newData) => {
      queryClient.setQueryData(['activeBattle'], newData);
      setMenu('main');
    }
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Battle...</div>;
  
  if (error || !battleRes) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <p>No active battle found.</p>
        <button onClick={() => navigate('/map')} className="px-4 py-2 bg-blue-600 rounded">Return to Map</button>
      </div>
    );
  }

  const wild = battleRes.wildPokemonData;
  const player = battleRes.playerPokemonData;
  const status = battleRes.status;
  const isFinished = status !== 'ACTIVE';
  
  // Last events logic to show what happened
  const allEvents = battleRes.events || [];
  const lastTurnEvents = allEvents.filter((e: any) => e.turn === battleRes.turnCount);

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[url('https://images.unsplash.com/photo-1518002171953-a080ee817e1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center overflow-hidden flex flex-col">
      {/* Overlay to darken background slightly */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      {toastMsg && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-3 rounded-lg border border-slate-700 z-50 shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Arena Area */}
      <div className="flex-1 relative z-10 p-4 md:p-8 flex flex-col">
        {/* Top: Wild Pokemon */}
        <div className="flex justify-end mb-12">
          <div className="flex items-end gap-4">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 w-72 shadow-2xl relative">
              <div className="flex justify-between items-end border-b border-slate-600 pb-2 mb-2">
                <h2 className="text-xl font-bold text-white capitalize">{wild.nickname}</h2>
                <span className="text-sm font-bold text-slate-300">Lv {wild.level}</span>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-3 mb-1 overflow-hidden border border-slate-900">
                <div 
                  className={`h-full transition-all duration-500 ${wild.currentHP / wild.stats.hp > 0.5 ? 'bg-green-500' : wild.currentHP / wild.stats.hp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.max(0, (wild.currentHP / wild.stats.hp) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-end gap-2 items-center">
                {wild.statusCondition && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500 text-white">{wild.statusCondition}</span>
                )}
              </div>
            </div>
            
            <div className="w-40 h-40 flex items-end justify-center relative pb-4">
              {/* Shadow */}
              <div className="absolute bottom-0 w-24 h-6 bg-black/40 rounded-[100%] blur-sm"></div>
              <img 
                src={`http://localhost:3000/sprites/${wild.id}.png`} 
                alt={wild.nickname} 
                className={`relative z-10 w-32 h-32 object-contain transition-all duration-500 ${wild.currentHP <= 0 ? 'opacity-0 translate-y-10' : 'animate-bounce-slow'}`}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
        </div>

        {/* Spacer to push player to bottom */}
        <div className="flex-1"></div>

        {/* Bottom: Player Pokemon */}
        <div className="flex justify-start">
          <div className="flex items-end gap-8">
            <div className="w-48 h-48 flex items-end justify-center relative pb-4">
              {/* Shadow */}
              <div className="absolute bottom-0 w-32 h-8 bg-black/40 rounded-[100%] blur-sm"></div>
              <img 
                src={`http://localhost:3000/sprites/${player.id}.png`} 
                alt={player.nickname} 
                className={`relative z-10 w-40 h-40 object-contain transition-all duration-500 ${player.currentHP <= 0 ? 'opacity-0 translate-y-10' : ''}`}
                style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }} // Flipped to face enemy
              />
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 w-72 shadow-2xl relative mb-12">
              <div className="flex justify-between items-end border-b border-slate-600 pb-2 mb-2">
                <h2 className="text-xl font-bold text-white capitalize">{player.nickname}</h2>
                <span className="text-sm font-bold text-slate-300">Lv {player.level}</span>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-3 mb-1 overflow-hidden border border-slate-900">
                <div 
                  className={`h-full transition-all duration-500 ${player.currentHP / player.stats.hp > 0.5 ? 'bg-green-500' : player.currentHP / player.stats.hp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.max(0, (player.currentHP / player.stats.hp) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="flex gap-2">
                  {player.statusCondition && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500 text-white">{player.statusCondition}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-white">{Math.max(0, player.currentHP)} / {player.stats.hp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom UI Console */}
      <div className="h-48 bg-slate-950 border-t-4 border-slate-800 flex relative z-20">
        {/* Battle Log Box */}
        <div className="flex-1 p-4 overflow-y-auto border-r-4 border-slate-800">
          {isFinished ? (
            <div className="h-full flex flex-col justify-center gap-4">
              <p className="text-xl text-white font-bold leading-relaxed">
                {status === 'WON' ? `You defeated the wild ${wild.nickname}!` : 
                 status === 'FLED' ? 'Got away safely!' : 'You blacked out!'}
              </p>
              <button 
                onClick={() => navigate('/map')} 
                className="self-start px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
              >
                Leave Battle
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-end min-h-full">
              {lastTurnEvents.length > 0 ? (
                lastTurnEvents.map((ev: any, i: number) => (
                  <p key={i} className="text-lg text-white mb-2 leading-relaxed">
                    {ev.message}
                  </p>
                ))
              ) : (
                <p className="text-xl text-white leading-relaxed">
                  What will <span className="capitalize text-blue-400">{player.nickname}</span> do?
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Menu Box */}
        <div className="w-[400px] p-2 bg-slate-900">
          {!isFinished && (
            <div className="h-full">
              {menu === 'main' ? (
                <div className="grid grid-cols-2 gap-2 h-full">
                  <button 
                    disabled={turnMutation.isPending}
                    onClick={() => setMenu('fight')}
                    className="bg-red-600/90 hover:bg-red-500 text-white font-bold text-xl rounded border-2 border-red-800 transition-colors"
                  >
                    FIGHT
                  </button>
                  <button 
                    disabled={turnMutation.isPending}
                    onClick={() => showToast("Catching pokemon is a future feature!")}
                    className="bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xl rounded border-2 border-blue-800 transition-colors"
                  >
                    BAG
                  </button>
                  <button 
                    disabled={turnMutation.isPending}
                    onClick={() => showToast("Switching pokemon is a future feature!")}
                    className="bg-green-600/90 hover:bg-green-500 text-white font-bold text-xl rounded border-2 border-green-800 transition-colors"
                  >
                    POKEMON
                  </button>
                  <button 
                    disabled={turnMutation.isPending}
                    onClick={() => turnMutation.mutate('run')}
                    className="bg-yellow-600/90 hover:bg-yellow-500 text-white font-bold text-xl rounded border-2 border-yellow-800 transition-colors"
                  >
                    RUN
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {player.moves.map((m: any, i: number) => (
                      <button 
                        key={i}
                        disabled={turnMutation.isPending}
                        onClick={() => turnMutation.mutate(`move:${m.name}`)}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded border border-slate-600 flex flex-col items-center justify-center transition-colors"
                      >
                        <span className="capitalize">{m.name.replace('-', ' ')}</span>
                      </button>
                    ))}
                    {/* Fill empty slots if less than 4 moves */}
                    {Array.from({ length: Math.max(0, 4 - player.moves.length) }).map((_, i) => (
                      <button key={`empty-${i}`} disabled className="bg-slate-800 text-slate-600 font-bold rounded border border-slate-700">
                        -
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setMenu('main')}
                    className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded border border-slate-600"
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
