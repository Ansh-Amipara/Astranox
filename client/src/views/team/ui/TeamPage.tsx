import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../../../shared/api/api';
import { getTypeSpriteUrl } from '../../../shared/api/axios';
import { TypeSelect } from '../../../components/ui/TypeSelect';
// --- Stat Calculation Utilities ---
function calculateHP(base: number, iv: number, level: number): number {
  if (base === 1) return 1;
  return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
}

function calculateStat(base: number, iv: number, level: number): number {
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

export function TeamPage() {
  const queryClient = useQueryClient();
  
  // State for different modals
  const [activeMenuPkm, setActiveMenuPkm] = useState<any>(null);
  const [detailsPkm, setDetailsPkm] = useState<any>(null);
  const [changeMovePkm, setChangeMovePkm] = useState<any>(null);
  const [evolutionPkm, setEvolutionPkm] = useState<any>(null);
  const [boostPkm, setBoostPkm] = useState<any>(null);
  const [boostIvPkm, setBoostIvPkm] = useState<any>(null);
  const [selectedIvStat, setSelectedIvStat] = useState<string>('ivHp');
  const [moveSearch, setMoveSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

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

  const removeMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.post(`/trainers/party/${pokemonId}/remove`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setActiveMenuPkm(null);
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

  const releaseMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.delete(`/trainers/${pokemonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setActiveMenuPkm(null);
    }
  });

  const evolveMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.post(`/trainers/party/${pokemonId}/evolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setEvolutionPkm(null);
    }
  });

  const boostMutation = useMutation({
    mutationFn: async ({ pokemonId, itemId }: { pokemonId: string, itemId: string }) => {
      await api.post(`/trainers/party/${pokemonId}/boost-potential`, { itemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setBoostPkm(null);
    }
  });

  const boostIvMutation = useMutation({
    mutationFn: async ({ pokemonId, itemId, stat }: { pokemonId: string, itemId: string, stat: string }) => {
      await api.post(`/trainers/party/${pokemonId}/boost-ivs`, { itemId, stat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setBoostIvPkm(null);
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
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Team</h1>
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
                        src={getSpriteUrl(pkm.speciesId)} 
                        alt={pkm.species?.name}
                        className="w-20 h-20 object-contain drop-shadow-md"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex flex-col">
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize truncate">
                            {pkm.nickname || pkm.species?.name}
                          </h3>
                        </div>
                      </div>

                      {/* 2nd Row: Type */}
                      <div className="mt-2 flex gap-1">
                        {pkm.species?.type1 && (
                          <img src={getTypeSpriteUrl(pkm.species.type1.name, false)} alt={pkm.species.type1.name} title={pkm.species.type1.name} className="h-6 w-auto object-contain drop-shadow-sm" />
                        )}
                        {pkm.species?.type2 && (
                          <img src={getTypeSpriteUrl(pkm.species.type2.name, false)} alt={pkm.species.type2.name} title={pkm.species.type2.name} className="h-6 w-auto object-contain drop-shadow-sm" />
                        )}
                      </div>

                      {/* 3rd Row: Potential and CP */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {pkm.potential && (
                          <span className="text-[11px] uppercase tracking-wider px-2 py-1 rounded font-bold border border-yellow-300/50 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-300">
                            {pkm.potential.replace('_', ' ')}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded font-black border border-indigo-200 dark:border-indigo-800/50 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider`}>
                          CP {pkm.cp?.toLocaleString() || 0}
                        </span>
                      </div>

                      {/* Level and XP */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded border border-blue-100 dark:border-blue-900/50">
                          <span className="text-xs font-bold uppercase mr-1 opacity-70">Lv.</span>
                          <span className="text-sm font-black">{pkm.level}</span>
                        </div>
                        {pkm.potential && pkm.level >= ({ BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200, DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 600, SOVEREIGN: 700, LEGENDARY: 800, DIVINE: 900, CELESTIAL: 1000, PRIMORDIAL: 1200, MYTHICAL: 1400, INFINITY: 1700, ETERNAL: 2000 }[pkm.potential as string] || 2000) ? (
                          <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded border border-red-100 dark:border-red-900/50">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Capped</span>
                          </div>
                        ) : (
                          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-bold uppercase mr-1 opacity-70">XP</span>
                            <span className="text-sm font-bold">{(pkm.currentXp || 0).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].map(i => {
                          const move = pkm.moves?.find((m: any) => m.slot === i)?.move;
                          return (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded border border-slate-100 dark:border-slate-800 flex items-center justify-start gap-1.5 overflow-hidden">
                              {move ? (
                                <>
                                  <img src={getTypeSpriteUrl(move.type, true)} alt={move.type} title={move.type} className="h-4 w-auto object-contain drop-shadow-sm shrink-0" />
                                  <span className="font-bold text-slate-700 dark:text-slate-200 capitalize text-xs truncate w-full">{move.name.replace('-', ' ')}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 italic text-xs">- Empty -</span>
                              )}
                            </div>
                          );
                        })}
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
                src={getSpriteUrl(activeMenuPkm.speciesId)} 
                className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg object-contain pixelated border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="font-bold capitalize text-slate-900 dark:text-white">{activeMenuPkm.nickname || activeMenuPkm.species?.name}</h3>
                <p className="text-xs font-bold text-slate-500">
                  Lv. {activeMenuPkm.level} 
                  {activeMenuPkm.potential && activeMenuPkm.level >= ({ BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200, DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 600, SOVEREIGN: 700, LEGENDARY: 800, DIVINE: 900, CELESTIAL: 1000, PRIMORDIAL: 1200, MYTHICAL: 1400, INFINITY: 1700, ETERNAL: 2000 }[activeMenuPkm.potential as string] || 2000) ? (
                    <span className="font-bold text-red-500 ml-1 uppercase text-[10px]">Capped</span>
                  ) : (
                    <span className="font-medium text-slate-400 opacity-80 ml-1">• {activeMenuPkm.currentXp.toLocaleString()} XP</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setDetailsPkm(activeMenuPkm); setActiveMenuPkm(null); }}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
              >
                View Details
              </button>
              
              <button 
                onClick={() => handleMoveUp(activeMenuPkm)}
                disabled={activeMenuPkm.position === 0 || swapMutation.isPending}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Move Up
              </button>
              
              <button 
                onClick={() => handleMoveDown(activeMenuPkm)}
                disabled={activeMenuPkm.position === 5 || swapMutation.isPending}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Move Down
              </button>
              
              <button 
                onClick={() => { 
                  setChangeMovePkm({ ...activeMenuPkm, currentMoves: [0, 1, 2, 3].map(i => activeMenuPkm.moves?.find((m: any) => m.slot === i)?.move?.name || 'tackle') });
                  setMoveSearch('');
                  setActiveMenuPkm(null);
                }}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
              >
                Change Moves
              </button>

              {activeMenuPkm.species?.evolvesToId && (
                <button 
                  onClick={() => { 
                    setEvolutionPkm(activeMenuPkm);
                    setActiveMenuPkm(null);
                  }}
                  className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                >
                  Evolution
                </button>
              )}

              {activeMenuPkm.potential !== 'ETERNAL' && (
                <button 
                  onClick={() => { 
                    setBoostPkm(activeMenuPkm);
                    setActiveMenuPkm(null);
                  }}
                  className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                >
                  Boost Potential
                </button>
              )}
              
              <button 
                onClick={() => {
                  setBoostIvPkm(activeMenuPkm);
                  setActiveMenuPkm(null);
                }}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
              >
                Enhance IVs
              </button>

              <button 
                onClick={() => removeMutation.mutate(activeMenuPkm.id)}
                disabled={party.length <= 1 || removeMutation.isPending}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removeMutation.isPending ? 'Sending...' : 'Send to PC'}
              </button>

              <button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to release ${activeMenuPkm.nickname || activeMenuPkm.species?.name}? This cannot be undone.`)) {
                    releaseMutation.mutate(activeMenuPkm.id);
                  }
                }}
                disabled={party.length <= 1 || releaseMutation.isPending}
                className="w-full text-left px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-xl font-bold transition-colors text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {releaseMutation.isPending ? 'Releasing...' : 'Release Pokemon'}
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src={getSpriteUrl(detailsPkm.speciesId)} 
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
                    {detailsPkm.potential && (
                      <span className="text-xs px-2 py-1 rounded font-bold border border-yellow-300/50 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-300 capitalize">
                        {detailsPkm.potential.toLowerCase().replace('_', ' ')}
                      </span>
                    )}
                    {detailsPkm.potential && detailsPkm.level >= ({ BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200, DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 600, SOVEREIGN: 700, LEGENDARY: 800, DIVINE: 900, CELESTIAL: 1000, PRIMORDIAL: 1200, MYTHICAL: 1400, INFINITY: 1700, ETERNAL: 2000 }[detailsPkm.potential as string] || 2000) && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded uppercase tracking-wider">Capped</span>
                    )}
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium ml-auto">#{detailsPkm.species?.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailsPkm(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl">✕</button>
            </div>

            <div className="w-full">
              
              {/* Stats section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Stats Overview</h3>
                <div className="space-y-2">
                  {[
                    { label: 'HP', stat: calculateHP(detailsPkm.species.hp, detailsPkm.ivHp || 0, detailsPkm.level), iv: detailsPkm.ivHp || 0, base: detailsPkm.species.hp },
                    { label: 'Attack', stat: calculateStat(detailsPkm.species.attack, detailsPkm.ivAttack || 0, detailsPkm.level), iv: detailsPkm.ivAttack || 0, base: detailsPkm.species.attack },
                    { label: 'Defense', stat: calculateStat(detailsPkm.species.defense, detailsPkm.ivDefense || 0, detailsPkm.level), iv: detailsPkm.ivDefense || 0, base: detailsPkm.species.defense },
                    { label: 'Sp. Atk', stat: calculateStat(detailsPkm.species.spAtk, detailsPkm.ivSpAtk || 0, detailsPkm.level), iv: detailsPkm.ivSpAtk || 0, base: detailsPkm.species.spAtk },
                    { label: 'Sp. Def', stat: calculateStat(detailsPkm.species.spDef, detailsPkm.ivSpDef || 0, detailsPkm.level), iv: detailsPkm.ivSpDef || 0, base: detailsPkm.species.spDef },
                    { label: 'Speed', stat: calculateStat(detailsPkm.species.speed, detailsPkm.ivSpeed || 0, detailsPkm.level), iv: detailsPkm.ivSpeed || 0, base: detailsPkm.species.speed },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="w-20 font-bold text-slate-500 text-sm">{s.label}</span>
                        <div className="flex gap-2">
                          <span className="text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold">Base: {s.base}</span>
                          <span className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-1.5 py-0.5 rounded font-bold">IV: {s.iv}</span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white text-xl">{s.stat}</span>
                    </div>
                  ))}
                </div>
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
                <div className="flex flex-col gap-2 sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300">
                    {changeMovePkm.editingSlot !== undefined ? 'Select a move...' : 'Select "Swap" on a slot first'}
                  </h3>
                  <input
                    type="text"
                    placeholder="Search moves by name or type..."
                    value={moveSearch}
                    onChange={(e) => setMoveSearch(e.target.value)}
                    disabled={changeMovePkm.editingSlot === undefined}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <TypeSelect
                        value={typeFilter === 'all' ? '' : typeFilter}
                        onChange={(val) => setTypeFilter(val || 'all')}
                        types={Array.from(new Set(allMoves?.map((m: any) => m.type) || [])).sort() as string[]}
                        disabled={changeMovePkm.editingSlot === undefined}
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      disabled={changeMovePkm.editingSlot === undefined}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 transition-colors text-xs disabled:opacity-50"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="power_desc">Power (High to Low)</option>
                      <option value="power_asc">Power (Low to High)</option>
                    </select>
                  </div>
                </div>
                {changeMovePkm.editingSlot !== undefined && allMoves
                  ?.filter((move: any) => 
                    (typeFilter === 'all' || move.type === typeFilter) &&
                    (move.name.toLowerCase().includes(moveSearch.toLowerCase()) || 
                     move.type.toLowerCase().includes(moveSearch.toLowerCase()) ||
                     move.damageClass.toLowerCase().includes(moveSearch.toLowerCase()))
                  )
                  .sort((a: any, b: any) => {
                    if (sortBy === 'power_desc') {
                      return (b.power || 0) - (a.power || 0);
                    }
                    if (sortBy === 'power_asc') {
                      return (a.power || 0) - (b.power || 0);
                    }
                    return a.name.localeCompare(b.name);
                  })
                  .slice(0, 100) // Limit to 100 to prevent lagging the UI when search is empty
                  .map((move: any) => (
                  <button 
                    key={move.name}
                    onClick={() => {
                      const newMoves = [...changeMovePkm.currentMoves];
                      newMoves[changeMovePkm.editingSlot] = move.name;
                      setChangeMovePkm({ ...changeMovePkm, currentMoves: newMoves, editingSlot: undefined });
                      setMoveSearch('');
                    }}
                    className="flex flex-col p-3 rounded-lg border border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400 bg-white dark:bg-slate-800/50 text-left transition-colors"
                  >
                    <div className="flex justify-start gap-2 items-center w-full mb-1">
                      <img src={getTypeSpriteUrl(move.type, true)} alt={move.type} title={move.type} className="h-4 w-auto object-contain drop-shadow-sm shrink-0" />
                      <span className="font-bold capitalize text-slate-900 dark:text-white truncate">{move.name.replace('-', ' ')}</span>
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
                onClick={() => {
                  const moveIds = changeMovePkm.currentMoves
                    .filter(Boolean)
                    .map((moveName: string) => allMoves?.find((m: any) => m.name === moveName)?.id)
                    .filter(Boolean);
                  changeMovesMutation.mutate({ pokemonId: changeMovePkm.id, moves: moveIds });
                }}
                disabled={changeMovesMutation.isPending || changeMovePkm.editingSlot !== undefined}
                className="px-8 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-50"
              >
                {changeMovesMutation.isPending ? 'Saving...' : 'Save Moves'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. Evolution Modal --- */}
      {evolutionPkm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => !evolveMutation.isPending && setEvolutionPkm(null)}>
          <div className="bg-slate-900 border-2 border-purple-500 rounded-3xl p-8 w-full max-w-md flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.4)] relative overflow-hidden text-center" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40 pointer-events-none" />
            
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 relative z-10 tracking-widest uppercase">
              Evolution
            </h2>

            <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 shadow-inner">
                  <img src={getSpriteUrl(evolutionPkm.speciesId)} className="w-20 h-20 pixelated object-contain opacity-80 mix-blend-screen" />
                </div>
                <span className="mt-3 font-bold text-slate-300 capitalize text-sm">{evolutionPkm.nickname || evolutionPkm.species.name}</span>
              </div>

              <div className="flex flex-col items-center justify-center text-purple-400">
                <span className="text-3xl mb-1">➡️</span>
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Evolves To</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  <img src={getSpriteUrl(evolutionPkm.species.evolvesToId)} className="w-24 h-24 pixelated object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                </div>
                <span className="mt-3 font-bold text-white capitalize text-lg tracking-wide">? ? ?</span>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-5 mb-8 relative z-10 border border-slate-700 backdrop-blur-sm">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Evolution Requirement</h4>
              {evolutionPkm.species.evolutionLevel ? (
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white">Level {evolutionPkm.species.evolutionLevel}</span>
                  <span className={`text-sm mt-1 font-bold ${evolutionPkm.level >= evolutionPkm.species.evolutionLevel ? 'text-green-400' : 'text-red-400'}`}>
                    (Current: {evolutionPkm.level})
                  </span>
                </div>
              ) : evolutionPkm.species.evolutionItem ? (
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-white capitalize">{evolutionPkm.species.evolutionItem.replace('-', ' ')}</span>
                  <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-slate-900 ${save.inventory?.find((i: any) => i.itemId === evolutionPkm.species.evolutionItem)?.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    In Bag: {save.inventory?.find((i: any) => i.itemId === evolutionPkm.species.evolutionItem)?.quantity || 0}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex justify-center gap-4 relative z-10">
              <button 
                onClick={() => setEvolutionPkm(null)}
                disabled={evolveMutation.isPending}
                className="px-6 py-3 font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl transition-all disabled:opacity-50"
              >
                Cancel (B)
              </button>
              
              {((evolutionPkm.species.evolutionLevel && evolutionPkm.level >= evolutionPkm.species.evolutionLevel) || 
                (evolutionPkm.species.evolutionItem && save.inventory?.find((i: any) => i.itemId === evolutionPkm.species.evolutionItem)?.quantity > 0)) && (
                <button 
                  onClick={() => evolveMutation.mutate(evolutionPkm.id)}
                  disabled={evolveMutation.isPending}
                  className="px-8 py-3 font-black tracking-widest text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {evolveMutation.isPending ? 'EVOLVING...' : 'EVOLVE NOW!'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 5. Boost Potential Modal --- */}
      {boostPkm && (() => {
        const potentialMap: Record<string, { next: string, item: string, itemName: string }> = {
          'BLACK_IRON': { next: 'BRONZE', item: 'bronze-crystal', itemName: 'Bronze Crystal' },
          'BRONZE': { next: 'SILVER', item: 'silver-crystal', itemName: 'Silver Crystal' },
          'SILVER': { next: 'GOLD', item: 'gold-crystal', itemName: 'Gold Crystal' },
          'GOLD': { next: 'PLATINUM', item: 'platinum-crystal', itemName: 'Platinum Crystal' },
          'PLATINUM': { next: 'ADAMANTITE', item: 'adamantite-crystal', itemName: 'Adamantite Crystal' },
          'ADAMANTITE': { next: 'DIAMOND', item: 'diamond-crystal', itemName: 'Diamond Crystal' },
          'DIAMOND': { next: 'CRYSTAL', item: 'crystal-crystal', itemName: 'Crystal Crystal' },
          'CRYSTAL': { next: 'EPIC', item: 'epic-crystal', itemName: 'Epic Crystal' },
          'EPIC': { next: 'HEROIC', item: 'heroic-crystal', itemName: 'Heroic Crystal' },
          'HEROIC': { next: 'SOVEREIGN', item: 'sovereign-crystal', itemName: 'Sovereign Crystal' },
          'SOVEREIGN': { next: 'LEGENDARY', item: 'legendary-crystal', itemName: 'Legendary Crystal' },
          'LEGENDARY': { next: 'DIVINE', item: 'divine-crystal', itemName: 'Divine Crystal' },
          'DIVINE': { next: 'CELESTIAL', item: 'celestial-crystal', itemName: 'Celestial Crystal' },
          'CELESTIAL': { next: 'PRIMORDIAL', item: 'primordial-crystal', itemName: 'Primordial Crystal' },
          'PRIMORDIAL': { next: 'MYTHICAL', item: 'mythical-crystal', itemName: 'Mythical Crystal' },
          'MYTHICAL': { next: 'INFINITY', item: 'infinity-crystal', itemName: 'Infinity Crystal' },
          'INFINITY': { next: 'ETERNAL', item: 'eternal-crystal', itemName: 'Eternal Crystal' },
        };
        const mapping = potentialMap[boostPkm.potential];
        const ownedCrystal = save.inventory?.find((i: any) => i.itemId === mapping?.item);
        const hasCrystal = ownedCrystal && ownedCrystal.quantity > 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => !boostMutation.isPending && setBoostPkm(null)}>
            <div className="bg-slate-900 border-2 border-yellow-500 rounded-3xl p-8 w-full max-w-md flex flex-col shadow-[0_0_50px_rgba(234,179,8,0.2)] relative overflow-hidden text-center" onClick={e => e.stopPropagation()}>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 to-amber-900/20 pointer-events-none" />
              
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-6 relative z-10 tracking-widest uppercase">
                Boost Potential
              </h2>

              <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 shadow-inner">
                    <img src={getSpriteUrl(boostPkm.speciesId)} className="w-20 h-20 pixelated object-contain opacity-80 mix-blend-screen" />
                  </div>
                  <span className="mt-3 font-bold text-slate-300 capitalize text-sm">{boostPkm.nickname || boostPkm.species.name}</span>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-5 mb-8 relative z-10 border border-slate-700 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Current Potential</span>
                    <span className="text-lg font-black text-slate-300">{boostPkm.potential.replace('_', ' ')}</span>
                  </div>
                  <span className="text-2xl text-yellow-500">➡️</span>
                  <div className="flex flex-col text-right">
                    <span className="text-xs uppercase font-bold text-yellow-500 tracking-wider">Next Potential</span>
                    <span className="text-lg font-black text-yellow-400">{mapping?.next.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Required Crystal</h4>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-white">{mapping?.itemName}</span>
                    <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-slate-900 ${hasCrystal ? 'text-green-400' : 'text-red-400'}`}>
                      In Bag: {ownedCrystal?.quantity || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 relative z-10">
                <button 
                  onClick={() => setBoostPkm(null)}
                  disabled={boostMutation.isPending}
                  className="px-6 py-3 font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                
                {hasCrystal && (
                  <button 
                    onClick={() => boostMutation.mutate({ pokemonId: boostPkm.id, itemId: mapping.item })}
                    disabled={boostMutation.isPending}
                    className="px-8 py-3 font-black tracking-widest text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {boostMutation.isPending ? 'BOOSTING...' : 'BOOST POTENTIAL!'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- 6. Enhance IVs Modal --- */}
      {boostIvPkm && (() => {
        const statValue = boostIvPkm[selectedIvStat] as number;
        let requiredItemId = '';
        let requiredItemName = '';
        let nextValue = statValue + 1;
        
        if (statValue <= 5) { requiredItemId = 'black-iron-iv-crystal'; requiredItemName = 'Black Iron IV Crystal'; nextValue = 6; }
        else if (statValue <= 10) { requiredItemId = 'bronze-iv-crystal'; requiredItemName = 'Bronze IV Crystal'; nextValue = 11; }
        else if (statValue <= 15) { requiredItemId = 'silver-iv-crystal'; requiredItemName = 'Silver IV Crystal'; nextValue = 16; }
        else if (statValue <= 20) { requiredItemId = 'gold-iv-crystal'; requiredItemName = 'Gold IV Crystal'; nextValue = 21; }
        else if (statValue <= 25) { requiredItemId = 'platinum-iv-crystal'; requiredItemName = 'Platinum IV Crystal'; nextValue = 26; }
        else if (statValue <= 30) { requiredItemId = 'diamond-iv-crystal'; requiredItemName = 'Diamond IV Crystal'; nextValue = 31; }

        const ownedCrystal = save.inventory?.find((i: any) => i.itemId === requiredItemId);
        const hasCrystal = ownedCrystal && ownedCrystal.quantity > 0;
        const isMaxed = statValue >= 31;

        const statOptions = [
          { key: 'ivHp', label: 'HP' },
          { key: 'ivAttack', label: 'Attack' },
          { key: 'ivDefense', label: 'Defense' },
          { key: 'ivSpAtk', label: 'Sp. Atk' },
          { key: 'ivSpDef', label: 'Sp. Def' },
          { key: 'ivSpeed', label: 'Speed' }
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => !boostIvMutation.isPending && setBoostIvPkm(null)}>
            <div className="bg-slate-900 border-2 border-blue-500 rounded-3xl p-8 w-full max-w-md flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden text-center" onClick={e => e.stopPropagation()}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 pointer-events-none" />
              
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-6 relative z-10 tracking-widest uppercase">
                Enhance IVs
              </h2>

              <div className="flex items-center justify-center gap-8 mb-6 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 shadow-inner">
                    <img src={getSpriteUrl(boostIvPkm.speciesId)} className="w-20 h-20 pixelated object-contain opacity-80 mix-blend-screen" />
                  </div>
                  <span className="mt-3 font-bold text-slate-300 capitalize text-sm">{boostIvPkm.nickname || boostIvPkm.species.name}</span>
                </div>
              </div>

              <div className="relative z-10 mb-6 flex justify-center flex-wrap gap-2">
                {statOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedIvStat(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${selectedIvStat === opt.key ? 'bg-blue-500 text-white border-blue-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                  >
                    {opt.label}: {boostIvPkm[opt.key]}
                  </button>
                ))}
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-5 mb-8 relative z-10 border border-slate-700 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Current IV</span>
                    <span className="text-lg font-black text-slate-300">{statValue}</span>
                  </div>
                  <span className="text-2xl text-blue-500">➡️</span>
                  <div className="flex flex-col text-right">
                    <span className="text-xs uppercase font-bold text-blue-500 tracking-wider">Next Tier</span>
                    <span className="text-lg font-black text-blue-400">{isMaxed ? 'MAX' : nextValue}</span>
                  </div>
                </div>

                {!isMaxed && (
                  <div className="border-t border-slate-700 pt-4 mt-2">
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Required Crystal</h4>
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-white">{requiredItemName}</span>
                      <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-slate-900 ${hasCrystal ? 'text-green-400' : 'text-red-400'}`}>
                        In Bag: {ownedCrystal?.quantity || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 relative z-10">
                <button 
                  onClick={() => setBoostIvPkm(null)}
                  disabled={boostIvMutation.isPending}
                  className="px-6 py-3 font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                
                {!isMaxed && hasCrystal && (
                  <button 
                    onClick={() => boostIvMutation.mutate({ pokemonId: boostIvPkm.id, itemId: requiredItemId, stat: selectedIvStat })}
                    disabled={boostIvMutation.isPending}
                    className="px-8 py-3 font-black tracking-widest text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {boostIvMutation.isPending ? 'ENHANCING...' : 'ENHANCE IV!'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
