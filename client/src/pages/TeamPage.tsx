import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// --- Stat Calculation Utilities ---
function calculateHP(base: number, iv: number, level: number): number {
  if (base === 1) return 1;
  const step1 = Math.floor(((2 * base + iv) * level) / 100);
  return step1 + level + 10;
}

function calculateStat(base: number, iv: number, level: number): number {
  const step1 = Math.floor(((2 * base + iv) * level) / 100);
  return step1 + 5;
}

export function TeamPage() {
  const queryClient = useQueryClient();
  
  // State for different modals
  const [activeMenuPkm, setActiveMenuPkm] = useState<any>(null);
  const [detailsPkm, setDetailsPkm] = useState<any>(null);
  const [changeMovePkm, setChangeMovePkm] = useState<any>(null);

  const { data: save, isLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  const { data: allMoves } = useQuery({
    queryKey: ['allMoves'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/moves');
      return data.data;
    }
  });

  const changeMovesMutation = useMutation({
    mutationFn: async ({ pokemonId, moves }: { pokemonId: string, moves: string[] }) => {
      await api.patch(`/trainers/party/${pokemonId}/moves`, { moves });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setChangeMovePkm(null);
    }
  });

  const swapMutation = useMutation({
    mutationFn: async ({ from, to }: { from: any, to: any }) => {
      await api.post('/trainers/swap', { from, to });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setActiveMenuPkm(null);
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Team Data...</div>;
  }

  const party = save?.party || [];

  const handleMoveUp = (pkm: any) => {
    if (pkm.position > 0) {
      swapMutation.mutate({
        from: { isParty: true, boxNumber: null, position: pkm.position },
        to: { isParty: true, boxNumber: null, position: pkm.position - 1 }
      });
    }
  };

  const handleMoveDown = (pkm: any) => {
    if (pkm.position < 5) {
      swapMutation.mutate({
        from: { isParty: true, boxNumber: null, position: pkm.position },
        to: { isParty: true, boxNumber: null, position: pkm.position + 1 }
      });
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Team</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">View the details and stats of your active Pokémon party.</p>
          </div>
          <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
            {party.length} / 6 Pokémon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => {
            const pkm = party.find((p: any) => p.position === i);

            return (
              <div 
                key={i} 
                className={`relative rounded-2xl overflow-hidden border transition-colors cursor-pointer ${pkm ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 shadow-lg hover:border-blue-500' : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30 shadow-sm dark:shadow-none'}`}
                onClick={() => {
                  if (pkm) setActiveMenuPkm(pkm);
                }}
              >
                {pkm ? (
                  <div className="p-6 flex items-start gap-6">
                    <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <img 
                        src={`http://localhost:3000/sprites/${pkm.speciesId}.png`} 
                        alt={pkm.species?.name}
                        className="w-20 h-20 object-contain drop-shadow-md"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize truncate">
                          {pkm.nickname || pkm.species?.name}
                        </h3>
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
                          Lv. {pkm.level}
                        </span>
                      </div>

                      {/* Display simplified types/basic info on the card now instead of the massive stats grid */}
                      <div className="mt-2 flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize`}>
                          {pkm.species?.type1?.name}
                        </span>
                        {pkm.species?.type2 && (
                          <span className={`text-xs px-2 py-1 rounded font-bold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize`}>
                            {pkm.species?.type2?.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Click for Details & Options
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 h-[140px] flex items-center justify-center">
                    <span className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-sm">Empty Slot</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 1. Options Menu Modal --- */}
      {activeMenuPkm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setActiveMenuPkm(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 w-full max-w-xs flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <img 
                src={`http://localhost:3000/sprites/${activeMenuPkm.speciesId}.png`} 
                className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg object-contain pixelated border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="font-bold capitalize text-slate-900 dark:text-white">{activeMenuPkm.nickname || activeMenuPkm.species?.name}</h3>
                <p className="text-xs font-bold text-slate-500">Lv. {activeMenuPkm.level}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setDetailsPkm(activeMenuPkm); setActiveMenuPkm(null); }}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
              >
                🔍 View Details
              </button>
              
              <button 
                onClick={() => handleMoveUp(activeMenuPkm)}
                disabled={activeMenuPkm.position === 0 || swapMutation.isPending}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⬆️ Move Up
              </button>
              
              <button 
                onClick={() => handleMoveDown(activeMenuPkm)}
                disabled={activeMenuPkm.position === 5 || swapMutation.isPending}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⬇️ Move Down
              </button>
              
              <button 
                onClick={() => { 
                  setChangeMovePkm({ ...activeMenuPkm, currentMoves: [activeMenuPkm.move1, activeMenuPkm.move2, activeMenuPkm.move3, activeMenuPkm.move4].map(m => m || 'tackle') });
                  setActiveMenuPkm(null);
                }}
                className="w-full text-left px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/50 dark:hover:bg-blue-800 dark:text-blue-300 rounded-xl font-bold transition-colors"
              >
                ⚔️ Change Moves
              </button>
            </div>
            
            <button 
              onClick={() => setActiveMenuPkm(null)}
              className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- 2. Details Modal --- */}
      {detailsPkm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailsPkm(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src={`http://localhost:3000/sprites/${detailsPkm.speciesId}.png`} 
                  className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl object-contain pixelated border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize">
                    {detailsPkm.nickname || detailsPkm.species?.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      Lv. {detailsPkm.level}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">#{detailsPkm.species?.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailsPkm(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Stats & IVs section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Stats & IVs</h3>
                <div className="space-y-2">
                  {[
                    { label: 'HP', iv: detailsPkm.ivHp, stat: calculateHP(detailsPkm.species.hp, detailsPkm.ivHp, detailsPkm.level) },
                    { label: 'Attack', iv: detailsPkm.ivAttack, stat: calculateStat(detailsPkm.species.attack, detailsPkm.ivAttack, detailsPkm.level) },
                    { label: 'Defense', iv: detailsPkm.ivDefense, stat: calculateStat(detailsPkm.species.defense, detailsPkm.ivDefense, detailsPkm.level) },
                    { label: 'Sp. Atk', iv: detailsPkm.ivSpAtk, stat: calculateStat(detailsPkm.species.spAtk, detailsPkm.ivSpAtk, detailsPkm.level) },
                    { label: 'Sp. Def', iv: detailsPkm.ivSpDef, stat: calculateStat(detailsPkm.species.spDef, detailsPkm.ivSpDef, detailsPkm.level) },
                    { label: 'Speed', iv: detailsPkm.ivSpeed, stat: calculateStat(detailsPkm.species.speed, detailsPkm.ivSpeed, detailsPkm.level) },
                  ].map(s => (
                    <div key={s.label} className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="w-20 font-bold text-slate-500 text-sm">{s.label}</span>
                      <span className="w-16 font-black text-slate-900 dark:text-white text-lg">{s.stat}</span>
                      <div className="flex-1 flex justify-end">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${s.iv === 31 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                          IV: {s.iv}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moves section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Learned Moves</h3>
                <div className="space-y-2">
                  {[detailsPkm.move1, detailsPkm.move2, detailsPkm.move3, detailsPkm.move4].map((m, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      {m ? (
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 dark:text-white capitalize">{m}</span>
                          <span className="text-xs text-slate-500 font-medium">Slot {idx + 1}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-medium italic">- Empty -</span>
                      )}
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    setChangeMovePkm({ ...detailsPkm, currentMoves: [detailsPkm.move1, detailsPkm.move2, detailsPkm.move3, detailsPkm.move4].map(m => m || 'tackle') });
                    setDetailsPkm(null);
                  }}
                  className="mt-4 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 dark:text-blue-300 font-bold py-3 rounded-xl transition-colors"
                >
                  Change Moves
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- 3. Move Management Modal (Unchanged structurally, just uses new state) --- */}
      {changeMovePkm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setChangeMovePkm(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                Change {changeMovePkm.nickname || changeMovePkm.species?.name}'s Moves
              </h2>
              <button 
                onClick={() => setChangeMovePkm(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Current Moves */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Current Moves</h3>
                {changeMovePkm.currentMoves.map((m: string, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 capitalize font-medium flex items-center justify-between text-slate-900 dark:text-slate-100">
                      {m || '-'}
                      <button 
                        onClick={() => {
                          const newMoves = [...changeMovePkm.currentMoves];
                          newMoves[idx] = ''; // clear slot to indicate editing
                          setChangeMovePkm({ ...changeMovePkm, currentMoves: newMoves, editingSlot: idx });
                        }}
                        className="text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 px-3 py-1.5 rounded transition-colors"
                      >
                        Swap
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Move Selection */}
              <div className="flex flex-col gap-2 overflow-y-auto pr-2 border-l border-slate-200 dark:border-slate-700 pl-4 custom-scrollbar">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">
                  {changeMovePkm.editingSlot !== undefined ? 'Select a move...' : 'Select "Swap" on a slot first'}
                </h3>
                {changeMovePkm.editingSlot !== undefined && allMoves?.map((move: any) => (
                  <button 
                    key={move.name}
                    onClick={() => {
                      const newMoves = [...changeMovePkm.currentMoves];
                      newMoves[changeMovePkm.editingSlot] = move.name;
                      setChangeMovePkm({ ...changeMovePkm, currentMoves: newMoves, editingSlot: undefined });
                    }}
                    className="flex flex-col p-3 rounded-lg border border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400 bg-white dark:bg-slate-800/50 text-left transition-colors"
                  >
                    <div className="flex justify-between items-center w-full mb-1">
                      <span className="font-bold capitalize text-slate-900 dark:text-white">{move.name}</span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400`}>
                        {move.type.name}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>PWR: {move.power || '-'}</span>
                      <span>ACC: {move.accuracy || '-'}</span>
                      <span className="capitalize">{move.damageClass}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setChangeMovePkm(null)}
                className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => changeMovesMutation.mutate({ pokemonId: changeMovePkm.id, moves: changeMovePkm.currentMoves.filter(Boolean) })}
                disabled={changeMovesMutation.isPending || changeMovePkm.editingSlot !== undefined}
                className="px-8 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-50"
              >
                {changeMovesMutation.isPending ? 'Saving...' : 'Save Moves'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pixelated { image-rendering: pixelated; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
      `}</style>
    </div>
  );
}
