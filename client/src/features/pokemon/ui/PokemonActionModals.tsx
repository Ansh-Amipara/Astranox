import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, getSpriteUrl } from '../../../shared/api/api';
import { getTypeSpriteUrl } from '../../../shared/api/axios';
import { TypeSelect } from '../../../components/ui/TypeSelect';
import { getPotentialBadgeClasses } from '../../../utils/pokemonUtils';
import { ArrowRight } from 'lucide-react';

// --- Stat Calculation Utilities ---
function calculateHP(base: number, iv: number, level: number, isGmax: boolean = false): number {
  if (base === 1) return 1;
  const hp = Math.floor(((2 * base + iv) * level) / 100) + level + 10;
  return isGmax ? hp * 2 : hp;
}

function calculateStat(base: number, iv: number, level: number): number {
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

function calculateCP(detailsPkm: any): number {
  if (!detailsPkm || !detailsPkm.species) return 0;
  const hp = calculateHP(detailsPkm.species.hp, detailsPkm.ivHp || 0, detailsPkm.level, detailsPkm.species.isGmax);
  const atk = calculateStat(detailsPkm.species.attack, detailsPkm.ivAttack || 0, detailsPkm.level);
  const def = calculateStat(detailsPkm.species.defense, detailsPkm.ivDefense || 0, detailsPkm.level);
  const spa = calculateStat(detailsPkm.species.spAtk, detailsPkm.ivSpAtk || 0, detailsPkm.level);
  const spd = calculateStat(detailsPkm.species.spDef, detailsPkm.ivSpDef || 0, detailsPkm.level);
  const spe = calculateStat(detailsPkm.species.speed, detailsPkm.ivSpeed || 0, detailsPkm.level);
  return hp + atk + def + spa + spd + spe;
}


export type PokemonModalsRef = {
  openDetails: (pkm: any) => void;
  openMoves: (pkm: any) => void;
  openEvolve: (pkm: any) => void;
  openBoost: (pkm: any) => void;
  openIVs: (pkm: any) => void;
  openGiveXp: (pkm: any) => void;
};

export type PokemonActionModalsProps = {

  activeMenuPkm: any | null;
  setActiveMenuPkm: (pkm: any | null) => void;
  save: any;
  allMoves: any;
  customActions?: (pkm: any) => React.ReactNode;
};


export const PokemonActionModals = forwardRef<PokemonModalsRef, PokemonActionModalsProps>(({
  activeMenuPkm, setActiveMenuPkm, save, allMoves, customActions
}, ref) => {

  const queryClient = useQueryClient();

  const [detailsPkm, setDetailsPkm] = useState<any>(null);
  const [changeMovePkm, setChangeMovePkm] = useState<any>(null);
  const [evolutionPkm, setEvolutionPkm] = useState<any>(null);
  const [boostPkm, setBoostPkm] = useState<any>(null);
  const [boostIvPkm, setBoostIvPkm] = useState<any>(null);
  const [giveXpPkm, setGiveXpPkm] = useState<any>(null);
  const [dynamaxPkm, setDynamaxPkm] = useState<any>(null);
  const [xpAmountInput, setXpAmountInput] = useState<string>('1000');
  const [selectedIvStat, setSelectedIvStat] = useState<string>('ivHp');
  const [selectedIvItem, setSelectedIvItem] = useState<'bottle-cap' | 'gold-bottle-cap'>('bottle-cap');
  const [selectedTransformation, setSelectedTransformation] = useState<any>(null);

  const { data: speciesInfo } = useQuery({
    queryKey: ['species', activeMenuPkm?.speciesId || evolutionPkm?.speciesId],
    queryFn: async () => {
      const id = activeMenuPkm?.speciesId || evolutionPkm?.speciesId;
      if (!id) return null;
      const { data } = await api.get(`/pokedex/${id}`);
      return data.data;
    },
    enabled: !!(activeMenuPkm || evolutionPkm)
  });

  const derivedTransformations = React.useMemo(() => {
    const active = activeMenuPkm || evolutionPkm;
    if (!active) return [];
    const t = [];
    if (active.species?.evolvesToId) {
      t.push({ isStandard: true, id: active.species.evolvesToId, name: active.species.evolvesTo?.name || 'Evolution' });
    }
    if (speciesInfo?.megas) t.push(...speciesInfo.megas);
    if (speciesInfo?.gmaxes) t.push(...speciesInfo.gmaxes);
    return t;
  }, [activeMenuPkm, evolutionPkm, speciesInfo]);

  React.useEffect(() => {
    if (!evolutionPkm) {
      setSelectedTransformation(null);
    } else if (derivedTransformations.length > 0) {
      if (!selectedTransformation || (selectedTransformation.baseSpeciesId !== evolutionPkm.speciesId && !selectedTransformation.isStandard)) {
        setSelectedTransformation(derivedTransformations[0]);
      }
    } else {
      setSelectedTransformation(null);
    }
  }, [evolutionPkm, derivedTransformations, selectedTransformation]);
  const [moveSearch, setMoveSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');


  useImperativeHandle(ref, () => ({
    openDetails: setDetailsPkm,
    openMoves: (pkm) => setChangeMovePkm({ ...pkm, currentMoves: [0, 1, 2, 3].map(i => pkm.moves?.find((m: any) => m.slot === i)?.move?.name || 'tackle') }),
    openEvolve: (pkm) => {
      setEvolutionPkm(pkm);
      setSelectedTransformation(null);
    },
    openBoost: setBoostPkm,
    openIVs: setBoostIvPkm,
    openGiveXp: (pkm) => {
      setGiveXpPkm(pkm);
      setXpAmountInput('1000');
    }
  }));

  const changeMovesMutation = useMutation({

    mutationFn: async ({ pokemonId, moves }: { pokemonId: string, moves: string[] }) => {
      await api.patch(`/trainers/party/${pokemonId}/moves`, { moves });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setChangeMovePkm(null);
    }
  });

  const releaseMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.delete(`/trainers/${pokemonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setActiveMenuPkm(null);
    }
  });

  const evolveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (typeof data === 'string') {
        await api.post(`/trainers/party/${data}/evolve`);
      } else {
        await api.post(`/trainers/party/${data.pokemonId}/evolve`, { targetSpeciesId: data.targetSpeciesId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setEvolutionPkm(null);
      setSelectedTransformation(null);
    }
  });

  const dynamaxMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.post('/inventory/use', { itemId: 'dynamax-candy', targetPokemonId: pokemonId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setDynamaxPkm(null);
    }
  });

  const boostMutation = useMutation({
    mutationFn: async ({ pokemonId, itemId }: { pokemonId: string, itemId: string }) => {
      await api.post(`/trainers/party/${pokemonId}/boost-potential`, { itemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setBoostPkm(null);
    }
  });

  const distributeXpMutation = useMutation({
    mutationFn: async ({ pokemonId, amount }: { pokemonId: string; amount: number }) => {
      const res = await api.post('/trainers/distribute-xp', { pokemonId, amount });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setGiveXpPkm(null);
    }
  });

  const boostIvMutation = useMutation({
    mutationFn: async ({ pokemonId, itemId, stat }: { pokemonId: string, itemId: string, stat: string }) => {
      await api.post(`/trainers/party/${pokemonId}/boost-ivs`, { itemId, stat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setBoostIvPkm(null);
    }
  });

  return (
    <>
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
                  {activeMenuPkm.potential && activeMenuPkm.level >= ({ BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200, DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 700, SOVEREIGN: 900, LEGENDARY: 1100, DIVINE: 1400, CELESTIAL: 1700, PRIMORDIAL: 2000, MYTHICAL: 3000, INFINITY: 4000, ETERNAL: 5000 }[activeMenuPkm.potential as string] || 5000) ? (
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

              {customActions && customActions(activeMenuPkm)}

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

              {(() => {
                const hasEvolutions = !!activeMenuPkm.species?.evolvesToId;
                const hasMegaForms = speciesInfo?.megas?.length > 0;
                const hasGmaxForms = speciesInfo?.gmaxes?.length > 0;
                const canEvolve = hasEvolutions || hasMegaForms || hasGmaxForms;
                return (
                  <button
                    onClick={() => {
                      if (!canEvolve) return;
                      setEvolutionPkm(activeMenuPkm);
                      setSelectedTransformation(derivedTransformations[0] || null);
                      setActiveMenuPkm(null);
                    }}
                    disabled={!canEvolve}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${canEvolve ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'}`}
                  >
                    {canEvolve ? 'Evolution' : 'Fully Evolved'}
                  </button>
                );
              })()}



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
                onClick={() => {
                  toast(`Are you sure you want to release ${activeMenuPkm.nickname || activeMenuPkm.species?.name}? This cannot be undone.`, {
                    action: {
                      label: 'Release',
                      onClick: () => releaseMutation.mutate(activeMenuPkm.id)
                    },
                    cancel: {
                      label: 'Cancel',
                      onClick: () => {}
                    },
                    duration: 5000
                  });
                }}
                disabled={releaseMutation.isPending}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded font-bold border border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                      Lv. {detailsPkm.level}
                    </span>
                    {detailsPkm.potential && (
                      <span className={getPotentialBadgeClasses(detailsPkm.potential)}>
                        {detailsPkm.potential.replace('_', ' ')}
                      </span>
                    )}
                    {detailsPkm.potential && detailsPkm.level >= ({ BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200, DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 700, SOVEREIGN: 900, LEGENDARY: 1100, DIVINE: 1400, CELESTIAL: 1700, PRIMORDIAL: 2000, MYTHICAL: 3000, INFINITY: 4000, ETERNAL: 5000 }[detailsPkm.potential as string] || 5000) && (
                      <span className="text-xs px-2 py-1 rounded font-bold border border-red-200 dark:border-red-900/50 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 uppercase tracking-wider">
                        Capped
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailsPkm(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl">✕</button>
            </div>

            <div className="w-full">

              {/* Stats section */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Stats Overview</h3>
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3">Stat</th>
                        <th className="px-4 py-3 text-center">Base</th>
                        <th className="px-4 py-3 text-center">IV</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { label: 'HP', stat: calculateHP(detailsPkm.species.hp, detailsPkm.ivHp || 0, detailsPkm.level, detailsPkm.species.isGmax), iv: detailsPkm.ivHp || 0, base: detailsPkm.species.hp },
                        { label: 'Attack', stat: calculateStat(detailsPkm.species.attack, detailsPkm.ivAttack || 0, detailsPkm.level), iv: detailsPkm.ivAttack || 0, base: detailsPkm.species.attack },
                        { label: 'Defense', stat: calculateStat(detailsPkm.species.defense, detailsPkm.ivDefense || 0, detailsPkm.level), iv: detailsPkm.ivDefense || 0, base: detailsPkm.species.defense },
                        { label: 'Sp. Atk', stat: calculateStat(detailsPkm.species.spAtk, detailsPkm.ivSpAtk || 0, detailsPkm.level), iv: detailsPkm.ivSpAtk || 0, base: detailsPkm.species.spAtk },
                        { label: 'Sp. Def', stat: calculateStat(detailsPkm.species.spDef, detailsPkm.ivSpDef || 0, detailsPkm.level), iv: detailsPkm.ivSpDef || 0, base: detailsPkm.species.spDef },
                        { label: 'Speed', stat: calculateStat(detailsPkm.species.speed, detailsPkm.ivSpeed || 0, detailsPkm.level), iv: detailsPkm.ivSpeed || 0, base: detailsPkm.species.speed },
                      ].map(s => (
                        <tr key={s.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{s.label}</td>
                          <td className="px-4 py-2 text-center text-slate-700 dark:text-slate-300">{s.base}</td>
                          <td className="px-4 py-2 text-center text-slate-700 dark:text-slate-300">{s.iv}</td>
                          <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-300">{s.stat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- 3. Move Management Modal --- */}
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
                        types={Array.from(new Set(allMoves?.map((m: any) => m.type) || [])).filter((t: any) => t !== 'shadow' && t !== 'unknown').sort() as string[]}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !evolveMutation.isPending && setEvolutionPkm(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 w-full max-w-md flex flex-col shadow-2xl relative overflow-hidden text-center" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 pointer-events-none" />

            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 relative z-10 tracking-widest uppercase">
              Evolution
            </h2>

            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50/50 dark:bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                  <img src={getSpriteUrl(evolutionPkm.speciesId)} className="w-20 h-20 pixelated object-contain opacity-80" />
                </div>
                <span className="mt-3 font-bold text-slate-700 dark:text-slate-300 capitalize text-sm">{evolutionPkm.nickname || evolutionPkm.species.name}</span>
              </div>

              <div className="flex flex-col items-center justify-center text-blue-500 animate-pulse">
                <ArrowRight className="w-10 h-10 mb-2" strokeWidth={2.5} />
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Evolves To</span>
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-28 h-28 ${selectedTransformation?.isGmax ? 'bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border-fuchsia-400 dark:border-fuchsia-500' : 'bg-blue-50/50 dark:bg-slate-800/80 border-blue-400 dark:border-blue-500'} rounded-full flex items-center justify-center border-2 shadow-lg relative mb-3`}>
                  {selectedTransformation ? (
                    <img src={getSpriteUrl(selectedTransformation.id)} className={`w-24 h-24 pixelated object-contain ${selectedTransformation?.isGmax ? 'drop-shadow-[0_0_15px_rgba(255,0,255,0.2)]' : ''}`} />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-slate-400 font-bold">NONE</div>
                  )}
                </div>
                
                {derivedTransformations.length > 1 && (
                  <div className="flex gap-3 mb-2 flex-wrap justify-center">
                    {derivedTransformations.map((transform: any) => (
                      <button
                        key={transform.id}
                        onClick={() => setSelectedTransformation(transform)}
                        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${selectedTransformation?.id === transform.id ? (transform.isGmax ? 'border-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-900/50 shadow-md scale-110' : 'border-blue-500 bg-blue-100 dark:bg-blue-900/50 shadow-md scale-110') : 'border-slate-300 bg-slate-100 dark:bg-slate-800 opacity-50 hover:opacity-100'}`}
                        title={transform.name}
                      >
                        <img src={getSpriteUrl(transform.id)} className="w-8 h-8 pixelated object-contain drop-shadow-sm" />
                      </button>
                    ))}
                  </div>
                )}
                
                <span className={`font-bold capitalize text-lg ${selectedTransformation?.isGmax ? 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600 dark:from-fuchsia-400 dark:to-purple-400 tracking-wide' : 'text-blue-600 dark:text-blue-400'}`}>
                  {selectedTransformation ? selectedTransformation.name.replace('-', ' ') : 'Fully Evolved'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-3">Evolution Requirement</h4>
              {(() => {
                if (selectedTransformation?.isGmax) {
                  const ownedCandy = save.inventory?.find((i: any) => i.itemId === 'dynamax-candy');
                  const hasCandy = ownedCandy && ownedCandy.quantity > 0;
                  return (
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-slate-800 dark:text-white capitalize">Dynamax Candy</span>
                      <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${hasCandy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        In Bag: {ownedCandy?.quantity || 0}
                      </span>
                    </div>
                  );
                }

                if (selectedTransformation?.isMega) {
                  let megaStoneName = selectedTransformation.name.replace('-mega', 'ite');
                  if (megaStoneName.includes('ite-x')) megaStoneName = megaStoneName.replace('ite-x', 'ite-x');
                  if (megaStoneName.includes('ite-y')) megaStoneName = megaStoneName.replace('ite-y', 'ite-y');
                  const hasMegaStone = save.inventory?.find((i: any) => i.itemId === megaStoneName)?.quantity > 0;
                  return (
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-slate-800 dark:text-white capitalize">{megaStoneName.replace('-', ' ')}</span>
                      <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${hasMegaStone ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        In Bag: {save.inventory?.find((i: any) => i.itemId === megaStoneName)?.quantity || 0}
                      </span>
                    </div>
                  );
                }
                
                if (evolutionPkm.species.evolutionLevel) {
                  return (
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">Level {evolutionPkm.species.evolutionLevel}</span>
                      <span className={`text-sm mt-1 font-bold ${evolutionPkm.level >= evolutionPkm.species.evolutionLevel ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        (Current: {evolutionPkm.level})
                      </span>
                    </div>
                  );
                }
                
                if (evolutionPkm.species.evolutionItem) {
                  return (
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-slate-800 dark:text-white capitalize">{evolutionPkm.species.evolutionItem.replace('-', ' ')}</span>
                      <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${save.inventory?.find((i: any) => i.itemId === evolutionPkm.species.evolutionItem)?.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        In Bag: {save.inventory?.find((i: any) => i.itemId === evolutionPkm.species.evolutionItem)?.quantity || 0}
                      </span>
                    </div>
                  );
                }
                
                return null;
              })()}
            </div>

            <div className="flex justify-center gap-4 relative z-10">
              <button
                onClick={() => { setEvolutionPkm(null); setSelectedTransformation(null); }}
                disabled={evolveMutation.isPending || dynamaxMutation.isPending}
                className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {(() => {
                let canPerformEvolution = false;
                
                if (selectedTransformation?.isGmax) {
                  canPerformEvolution = save.inventory?.find((i: any) => i.itemId === 'dynamax-candy')?.quantity > 0;
                  return (
                    <button
                      onClick={() => dynamaxMutation.mutate(evolutionPkm.id)}
                      disabled={!canPerformEvolution || dynamaxMutation.isPending}
                      className={`px-8 py-3 font-black tracking-widest text-white rounded-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none ${canPerformEvolution ? 'bg-fuchsia-600 hover:bg-fuchsia-500 shadow-lg hover:shadow-xl' : 'bg-slate-500'}`}
                    >
                      {dynamaxMutation.isPending ? 'TRANSFORMING...' : canPerformEvolution ? 'GIGANTAMAX!' : 'CANNOT GMAX'}
                    </button>
                  );
                }
                
                if (selectedTransformation?.isMega) {
                  let megaStoneName = selectedTransformation.name.replace('-mega', 'ite');
                  if (megaStoneName.includes('ite-x')) megaStoneName = megaStoneName.replace('ite-x', 'ite-x');
                  if (megaStoneName.includes('ite-y')) megaStoneName = megaStoneName.replace('ite-y', 'ite-y');
                  canPerformEvolution = save.inventory?.find((i: any) => i.itemId === megaStoneName)?.quantity > 0;
                } else if (selectedTransformation?.isStandard) {
                  canPerformEvolution = (evolutionPkm.species.evolutionLevel && evolutionPkm.level >= evolutionPkm.species.evolutionLevel) ||
                                        (evolutionPkm.species.evolutionItem && save.inventory?.find((i: any) => i.itemId === evolutionPkm.species.evolutionItem)?.quantity > 0);
                }

                return (
                  <button
                    onClick={() => {
                      if (selectedTransformation?.isMega) {
                        evolveMutation.mutate({ pokemonId: evolutionPkm.id, targetSpeciesId: selectedTransformation.id } as any);
                      } else {
                        evolveMutation.mutate(evolutionPkm.id);
                      }
                    }}
                    disabled={!canPerformEvolution || evolveMutation.isPending}
                    className={`px-8 py-3 font-black tracking-widest text-white rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none ${canPerformEvolution ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'bg-slate-500'}`}
                  >
                    {evolveMutation.isPending ? 'EVOLVING...' : canPerformEvolution ? 'EVOLVE!' : 'CANNOT EVOLVE'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* --- 5. Boost Potential Modal --- */}
      {boostPkm && (() => {
        const potentialMap: Record<string, { next: string, item: string, itemName: string }> = {
          'BLACK_IRON': { next: 'BRONZE', item: 'bronze-pearl', itemName: 'Bronze Pearl' },
          'BRONZE': { next: 'SILVER', item: 'silver-pearl', itemName: 'Silver Pearl' },
          'SILVER': { next: 'GOLD', item: 'gold-pearl', itemName: 'Gold Pearl' },
          'GOLD': { next: 'PLATINUM', item: 'platinum-pearl', itemName: 'Platinum Pearl' },
          'PLATINUM': { next: 'ADAMANTITE', item: 'adamantite-pearl', itemName: 'Adamantite Pearl' },
          'ADAMANTITE': { next: 'DIAMOND', item: 'diamond-pearl', itemName: 'Diamond Pearl' },
          'DIAMOND': { next: 'CRYSTAL', item: 'crystal-pearl', itemName: 'Crystal Pearl' },
          'CRYSTAL': { next: 'EPIC', item: 'epic-pearl', itemName: 'Epic Pearl' },
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

        const themeMap: Record<string, { border: string, shadow: string, bgGradient: string, textGradient: string, textBase: string, arrow: string, buttonBg: string, buttonHover: string }> = {
          'BRONZE': { border: 'border-amber-600 dark:border-amber-700', shadow: 'shadow-amber-900/20', bgGradient: 'from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20', textGradient: 'from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500', textBase: 'text-amber-700 dark:text-amber-500', arrow: 'text-amber-500', buttonBg: 'bg-amber-600', buttonHover: 'hover:bg-amber-500' },
          'SILVER': { border: 'border-slate-400 dark:border-slate-400', shadow: 'shadow-slate-400/20', bgGradient: 'from-slate-50/50 to-gray-50/50 dark:from-slate-700/20 dark:to-slate-900/20', textGradient: 'from-slate-500 to-slate-400 dark:from-slate-300 dark:to-slate-400', textBase: 'text-slate-600 dark:text-slate-400', arrow: 'text-slate-400', buttonBg: 'bg-slate-500', buttonHover: 'hover:bg-slate-400' },
          'GOLD': { border: 'border-yellow-500 dark:border-yellow-500', shadow: 'shadow-yellow-500/20', bgGradient: 'from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/20 dark:to-amber-900/20', textGradient: 'from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-500', textBase: 'text-yellow-600 dark:text-yellow-500', arrow: 'text-yellow-500', buttonBg: 'bg-yellow-500', buttonHover: 'hover:bg-yellow-400' },
          'PLATINUM': { border: 'border-cyan-400 dark:border-cyan-400', shadow: 'shadow-cyan-400/20', bgGradient: 'from-cyan-50/50 to-teal-50/50 dark:from-cyan-900/20 dark:to-teal-900/20', textGradient: 'from-cyan-600 to-teal-600 dark:from-cyan-300 dark:to-teal-400', textBase: 'text-cyan-600 dark:text-cyan-400', arrow: 'text-cyan-400', buttonBg: 'bg-cyan-500', buttonHover: 'hover:bg-cyan-400' },
          'ADAMANTITE': { border: 'border-red-600 dark:border-red-600', shadow: 'shadow-red-600/20', bgGradient: 'from-red-50/50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20', textGradient: 'from-red-600 to-rose-600 dark:from-red-500 dark:to-rose-600', textBase: 'text-red-600 dark:text-red-500', arrow: 'text-red-500', buttonBg: 'bg-red-600', buttonHover: 'hover:bg-red-500' },
          'DIAMOND': { border: 'border-sky-400 dark:border-sky-400', shadow: 'shadow-sky-400/20', bgGradient: 'from-sky-50/50 to-blue-50/50 dark:from-sky-900/20 dark:to-blue-900/20', textGradient: 'from-sky-600 to-blue-600 dark:from-sky-300 dark:to-blue-400', textBase: 'text-sky-600 dark:text-sky-400', arrow: 'text-sky-400', buttonBg: 'bg-sky-500', buttonHover: 'hover:bg-sky-400' },
          'CRYSTAL': { border: 'border-fuchsia-400 dark:border-fuchsia-400', shadow: 'shadow-fuchsia-400/20', bgGradient: 'from-fuchsia-50/50 to-purple-50/50 dark:from-fuchsia-900/20 dark:to-purple-900/20', textGradient: 'from-fuchsia-600 to-purple-600 dark:from-fuchsia-300 dark:to-purple-400', textBase: 'text-fuchsia-600 dark:text-fuchsia-400', arrow: 'text-fuchsia-400', buttonBg: 'bg-fuchsia-500', buttonHover: 'hover:bg-fuchsia-400' },
          'EPIC': { border: 'border-purple-600 dark:border-purple-600', shadow: 'shadow-purple-600/20', bgGradient: 'from-purple-50/50 to-violet-50/50 dark:from-purple-900/20 dark:to-violet-900/20', textGradient: 'from-purple-600 to-violet-600 dark:from-purple-500 dark:to-violet-600', textBase: 'text-purple-600 dark:text-purple-500', arrow: 'text-purple-500', buttonBg: 'bg-purple-600', buttonHover: 'hover:bg-purple-500' },
        };
        const theme = themeMap[mapping?.next] || themeMap['GOLD'];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !boostMutation.isPending && setBoostPkm(null)}>
            <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 w-full max-w-md flex flex-col shadow-2xl relative overflow-hidden text-center`} onClick={e => e.stopPropagation()}>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} pointer-events-none`} />

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 relative z-10 tracking-widest uppercase">
                Boost Potential
              </h2>

              <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                    <img src={getSpriteUrl(boostPkm.speciesId)} className="w-20 h-20 pixelated object-contain opacity-80" />
                  </div>
                  <span className="mt-3 font-bold text-slate-700 dark:text-slate-300 capitalize text-sm">{boostPkm.potential.replace('_', ' ')}</span>
                </div>

                <div className={`flex flex-col items-center justify-center ${theme.arrow} animate-pulse`}>
                  <ArrowRight className="w-10 h-10 mb-2" strokeWidth={2.5} />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Upgrades To</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className={`w-28 h-28 bg-white dark:bg-slate-800/80 rounded-full flex items-center justify-center border-2 ${theme.border} shadow-lg`}>
                    <img src={getSpriteUrl(boostPkm.speciesId)} className="w-24 h-24 pixelated object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                  </div>
                  <span className={`mt-3 font-bold capitalize text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r ${theme.textGradient}`}>{mapping?.next.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 relative z-10 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-3">Required Item</h4>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-slate-800 dark:text-white">{mapping?.itemName}</span>
                  <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${hasCrystal ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    In Bag: {ownedCrystal?.quantity || 0}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-4 relative z-10">
                <button
                  onClick={() => setBoostPkm(null)}
                  disabled={boostMutation.isPending}
                  className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                {hasCrystal && (
                  <button
                    onClick={() => boostMutation.mutate({ pokemonId: boostPkm.id, itemId: mapping.item })}
                    disabled={boostMutation.isPending}
                    className={`px-8 py-3 font-black tracking-widest text-white ${theme.buttonBg} ${theme.buttonHover} rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed`}
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
        const isGold = selectedIvItem === 'gold-bottle-cap';
        const requiredItemId = isGold ? 'gold-bottle-cap' : 'bottle-cap';
        const requiredItemName = isGold ? 'Gold Bottle Cap' : 'Bottle Cap';
        
        const statOptions = [
          { key: 'ivHp', label: 'HP' },
          { key: 'ivAttack', label: 'Attack' },
          { key: 'ivDefense', label: 'Defense' },
          { key: 'ivSpAtk', label: 'Sp. Atk' },
          { key: 'ivSpDef', label: 'Sp. Def' },
          { key: 'ivSpeed', label: 'Speed' }
        ];

        const ownedCrystal = save.inventory?.find((i: any) => i.itemId === requiredItemId);
        const hasCrystal = ownedCrystal && ownedCrystal.quantity > 0;
        
        const isMaxed = isGold 
          ? statOptions.every(opt => (boostIvPkm[opt.key] as number) >= 31)
          : (boostIvPkm[selectedIvStat] as number) >= 31;
          
        const statValue = boostIvPkm[selectedIvStat] as number;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !boostIvMutation.isPending && setBoostIvPkm(null)}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 w-full max-w-lg flex flex-col shadow-2xl relative overflow-hidden text-center" onClick={e => e.stopPropagation()}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 pointer-events-none" />

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 relative z-10 tracking-widest uppercase">
                Enhance IVs
              </h2>

              <div className="relative z-10 mb-6 flex justify-center gap-4 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                <button
                  onClick={() => setSelectedIvItem('bottle-cap')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${!isGold ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'}`}
                >
                  Bottle Cap
                </button>
                <button
                  onClick={() => setSelectedIvItem('gold-bottle-cap')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${isGold ? 'bg-white dark:bg-slate-700 text-yellow-600 dark:text-yellow-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'}`}
                >
                  Gold Bottle Cap
                </button>
              </div>

              {!isGold && (
                <div className="relative z-10 mb-6 flex justify-center flex-wrap gap-2">
                  {statOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedIvStat(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${selectedIvStat === opt.key ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                      {opt.label}: {boostIvPkm[opt.key]}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    {isGold ? 'All IVs' : 'Current IV'}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white text-3xl">{isGold ? 'VARIES' : statValue}</span>
                </div>

                {!isMaxed && (
                  <div className="flex flex-col items-center justify-center text-blue-500 animate-pulse">
                    <ArrowRight className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                )}

                {!isMaxed && (
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {isGold ? 'All IVs' : 'Next IV'}
                    </span>
                    <span className="font-black text-blue-500 text-3xl">31</span>
                  </div>
                )}
                {isMaxed && (
                  <div className="flex flex-col items-center justify-center ml-8">
                    <span className="text-3xl font-black text-yellow-500 uppercase tracking-widest drop-shadow-md">MAXED!</span>
                  </div>
                )}
              </div>

              {!isMaxed && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 relative z-10 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-3">Required Item</h4>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-slate-800 dark:text-white">{requiredItemName}</span>
                    <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${hasCrystal ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      In Bag: {ownedCrystal?.quantity || 0}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4 relative z-10">
                <button
                  onClick={() => setBoostIvPkm(null)}
                  disabled={boostIvMutation.isPending}
                  className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                {!isMaxed && hasCrystal && (
                  <button
                    onClick={() => boostIvMutation.mutate({ pokemonId: boostIvPkm.id, itemId: requiredItemId, stat: selectedIvStat })}
                    disabled={boostIvMutation.isPending}
                    className="px-8 py-3 font-black tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {boostIvMutation.isPending ? 'ENHANCING...' : 'ENHANCE IV!'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- Give XP Modal --- */}
      {giveXpPkm && (() => {
        const potentialCaps: Record<string, number> = {
          BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200,
          DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 600, SOVEREIGN: 700, LEGENDARY: 800,
          DIVINE: 900, CELESTIAL: 1000, PRIMORDIAL: 1200, MYTHICAL: 1400, INFINITY: 1700, ETERNAL: 2000
        };
        const maxLvl = potentialCaps[giveXpPkm.potential as string] || 2000;
        const maxTotalXp = 50 * (maxLvl + 1) * maxLvl - 1;
        const neededXp = Math.max(0, maxTotalXp - (giveXpPkm.currentXp || 0));
        const storedXp = save?.storedXp || 0;
        const maxAllowed = Math.min(storedXp, neededXp);

        const addedAmount = parseInt(xpAmountInput || '0', 10);
        const newTotalXp = (giveXpPkm.currentXp || 0) + (isNaN(addedAmount) ? 0 : addedAmount);
        const previewLvl = Math.max(1, Math.floor((1 + Math.sqrt(1 + 4 * (newTotalXp / 50))) / 2));

        const handleAddXp = (addAmount: number) => {
          const currentVal = parseInt(xpAmountInput || '0', 10);
          const nextVal = isNaN(currentVal) ? addAmount : currentVal + addAmount;
          const cappedVal = Math.min(maxAllowed, nextVal);
          setXpAmountInput(cappedVal.toString());
        };

        const handleMaxXp = () => {
          setXpAmountInput(maxAllowed.toString());
        };

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setGiveXpPkm(null)}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <img
                  src={getSpriteUrl(giveXpPkm.speciesId)}
                  className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl object-contain pixelated border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-extrabold text-lg capitalize text-slate-900 dark:text-white">{giveXpPkm.nickname || giveXpPkm.species?.name}</h3>
                  <p className="text-xs font-bold text-slate-500">
                    Lv. {giveXpPkm.level} {addedAmount > 0 && <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">→ Lv. {previewLvl}</span>} • {newTotalXp.toLocaleString()} XP (Cap: Lv. {maxLvl})
                  </p>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl mb-4 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Your Stored XP:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <img src="/xp.png" alt="XP" className="w-4 h-4 object-contain" />
                  {save?.storedXp?.toLocaleString() || 0} XP
                </span>
              </div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Amount of XP to Give:
              </label>
              <input
                type="text"
                value={xpAmountInput}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                  const capped = Math.min(maxAllowed, val);
                  setXpAmountInput(capped > 0 ? capped.toString() : '');
                }}
                placeholder="Enter XP amount"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-lg mb-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-1.5 mb-6">
                {[1000, 5000, 25000, 100000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAddXp(amt)}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    +{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
                <button
                  onClick={handleMaxXp}
                  className="py-1.5 px-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 border border-indigo-300 dark:border-indigo-700/60 rounded-lg text-xs font-black text-indigo-700 dark:text-indigo-300 transition-colors uppercase tracking-wider"
                >
                  Max
                </button>
              </div>

              {distributeXpMutation.isError && (
                <p className="text-sm font-bold text-red-500 mb-4 text-center">
                  {(distributeXpMutation.error as any)?.response?.data?.error?.message || 'Failed to distribute XP'}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setGiveXpPkm(null)}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const amt = parseInt(xpAmountInput, 10);
                    if (amt > 0) {
                      distributeXpMutation.mutate({ pokemonId: giveXpPkm.id, amount: amt });
                    }
                  }}
                  disabled={!xpAmountInput || parseInt(xpAmountInput, 10) <= 0 || distributeXpMutation.isPending}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {distributeXpMutation.isPending ? 'Giving XP...' : 'Give XP'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </>
  );
});
