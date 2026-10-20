import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OwnedPokemonDto, MoveDto, InventoryItemDto } from '@astranox/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl, battleApi } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { ArrowRight } from 'lucide-react';
import { getPotentialBadgeClasses, formatPotential, getMaxLevelForPotential, getXpForLevel, getLevelFromXp } from '@/features/pokemon/pokemonUtils';
import { useSmeltPokemon } from '@/features/pokemon/hooks/useSmeltPokemon';

// --- Stat Calculation Utilities ---
function calculateHP(base: number, iv: number, level: number, isGmax: boolean = false): number {
  if (base === 1) return 1;
  const hp = Math.floor(((2 * base + iv) * level) / 100) + level + 10;
  return isGmax ? hp * 2 : hp;
}

function calculateStat(base: number, iv: number, level: number): number {
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}


export function TeamPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for different modals
  const [activeMenuPkm, setActiveMenuPkm] = useState<OwnedPokemonDto | null>(null);
  const [detailsPkm, setDetailsPkm] = useState<OwnedPokemonDto | null>(null);
  const [evolutionPkm, setEvolutionPkm] = useState<(OwnedPokemonDto & { megas?: { id: number, name: string, baseSpeciesId: number, baseSpeciesName: string, isGmax?: boolean, isStandard?: boolean }[] }) | null>(null);
  const [boostPkm, setBoostPkm] = useState<OwnedPokemonDto | null>(null);
  const [boostIvPkm, setBoostIvPkm] = useState<OwnedPokemonDto | null>(null);
  const [giveXpPkm, setGiveXpPkm] = useState<OwnedPokemonDto | null>(null);
  const [xpAmountInput, setXpAmountInput] = useState<string>('1000');
  const [selectedIvStat, setSelectedIvStat] = useState<string>('ivHp');

  const { SmeltResultUI } = useSmeltPokemon();
  const [selectedIvItem, setSelectedIvItem] = useState<'bottle-cap' | 'gold-bottle-cap'>('bottle-cap');
  const [selectedMega, setSelectedMega] = useState<{ id: number; name: string; baseSpeciesId?: number; baseSpeciesName?: string, isGmax?: boolean, isStandard?: boolean } | null>(null);

  const distributeXpMutation = useMutation({
    mutationFn: async ({ pokemonId, amount }: { pokemonId: string; amount: number }) => {
      const res = await api.post('/trainers/distribute-xp', { pokemonId, amount });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setGiveXpPkm(null);
    }
  });

  const { data: speciesInfo } = useQuery({
    queryKey: ['species', activeMenuPkm?.speciesId || evolutionPkm?.speciesId],
    queryFn: async () => {
      const id = activeMenuPkm?.speciesId || evolutionPkm?.speciesId;
      if (!id) return null;
      const { data } = await api.get(`/pokedex/species/${id}`);
      return data.data;
    },
    enabled: !!(activeMenuPkm || evolutionPkm)
  });

  useEffect(() => {
    if (!evolutionPkm) {
      setSelectedMega(null);
    } else if (speciesInfo && speciesInfo.id === evolutionPkm.speciesId) {
      const transformations = [...(speciesInfo.megas || []), ...(speciesInfo.gmaxes || [])];
      if (transformations.length > 0) {
        if (!selectedMega || selectedMega.baseSpeciesId !== evolutionPkm.speciesId) {
          setSelectedMega(transformations[0]);
        }
      } else {
        setSelectedMega(null);
      }
    }
  }, [evolutionPkm, speciesInfo, selectedMega]);



  const { data: save, isLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
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
    mutationFn: async ({ from, to }: { from: { isParty: boolean, boxNumber: number | null, position: number }, to: { isParty: boolean, boxNumber: number | null, position: number } }) => {
      await api.post('/trainers/swap', { from, to });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setActiveMenuPkm(null);
    }
  });

  const evolveMutation = useMutation({
    mutationFn: async (data: { pokemonId: string; targetSpeciesId?: number } | string) => {
      if (typeof data === 'string') {
        await api.post(`/trainers/party/${data}/evolve`);
      } else {
        await api.post(`/trainers/party/${data.pokemonId}/evolve`, { targetSpeciesId: data.targetSpeciesId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setEvolutionPkm(null);
      setSelectedMega(null);
    }
  });

  const devolveMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.post(`/trainers/party/${pokemonId}/devolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      setActiveMenuPkm(null);
    }
  });

  const engageMutation = useMutation({
    mutationFn: async (data: { speciesId: number; level: number; battleType?: string }) => {
      return await battleApi.engageCustomBattle(data);
    },
    onSuccess: () => {
      setEvolutionPkm(null);
      setSelectedMega(null);
      navigate(`/battle?returnUrl=${encodeURIComponent(window.location.pathname)}`);
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
    return <div className="min-h-[100dvh] bg-background flex items-center justify-center text-foreground transition-colors duration-200">Loading Team Data...</div>;
  }

  const party = save?.party || [];

  const handleMoveUp = (pkm: OwnedPokemonDto) => {
    if (pkm.position > 0) {
      swapMutation.mutate({
        from: { isParty: true, boxNumber: null as number | null, position: pkm.position },
        to: { isParty: true, boxNumber: null as number | null, position: pkm.position - 1 }
      });
    }
  };

  const handleMoveDown = (pkm: OwnedPokemonDto) => {
    if (pkm.position < 5) {
      swapMutation.mutate({
        from: { isParty: true, boxNumber: null as number | null, position: pkm.position },
        to: { isParty: true, boxNumber: null as number | null, position: pkm.position + 1 }
      });
    }
  };

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-4rem)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Active Team</h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">Manage your frontline battle party and move configurations</p>
          </div>
          <span className="bg-surface border border-border px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm text-foreground shadow-xs">
            {party.length} / 6 Pokémon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => {
            const pkm = party.find((p: OwnedPokemonDto) => p.position === i);

            return (
              <div
                key={i}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                  pkm
                    ? 'border-border bg-surface shadow-xs hover:shadow-md hover:-translate-y-0.5'
                    : 'border-2 border-dashed border-border/80 bg-surface/30 hover:bg-surface-raised/40 shadow-none'
                }`}
                onClick={() => {
                  if (pkm) setActiveMenuPkm(pkm);
                }}
              >
                {pkm ? (
                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                    {/* Top Section: Image and Core Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center bg-surface-raised rounded-2xl border border-border/70 shadow-xs relative group-hover:scale-105 transition-transform duration-200">
                        <img
                          src={getSpriteUrl(pkm.speciesId)}
                          alt={pkm.species?.name}
                          className="w-16 h-16 sm:w-18 sm:h-18 object-contain pixelated"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        {/* Header: Name and Bound Status */}
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <h3 className="text-base sm:text-lg font-black text-foreground capitalize truncate flex items-center gap-1.5">
                            <span className="truncate">{pkm.nickname || pkm.species?.name}</span>
                            {pkm.isBound && (
                              <span className="inline-flex items-center shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-raised text-muted uppercase tracking-wider" title="This Pokémon is bound to your account and cannot be traded or sold">
                                🔒
                              </span>
                            )}
                          </h3>
                        </div>

                        {/* Type */}
                        <div className="flex gap-1 mb-2">
                          {pkm.species?.type1 && (
                            <img src={getTypeSpriteUrl(pkm.species.type1.name, false)} alt={pkm.species.type1.name} title={pkm.species.type1.name} className="h-4.5 w-auto object-contain" />
                          )}
                          {pkm.species?.type2 && (
                            <img src={getTypeSpriteUrl(pkm.species.type2.name, false)} alt={pkm.species.type2.name} title={pkm.species.type2.name} className="h-4.5 w-auto object-contain" />
                          )}
                        </div>

                        {/* Potential and CP */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          {pkm.potential && (
                            <span className={`${getPotentialBadgeClasses(pkm.potential)} px-2 py-0.5 text-[11px]`}>
                              {formatPotential(pkm.potential)}
                            </span>
                          )}
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-black border border-border bg-surface-raised text-foreground uppercase tracking-wider">
                            CP {pkm.cp?.toLocaleString() || 0}
                          </span>
                        </div>

                        {/* Level and XP */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center bg-surface-raised text-foreground px-2 py-0.5 rounded-md border border-border">
                            <span className="text-[9px] font-bold uppercase mr-1 text-muted">Lv.</span>
                            <span className="text-xs font-black">{pkm.level}</span>
                          </div>
                          {pkm.potential && pkm.level >= getMaxLevelForPotential(pkm.potential as string) ? (
                            <div className="flex items-center bg-surface-raised text-foreground px-2 py-0.5 rounded-md border border-border">
                              <span className="text-[9px] font-black uppercase tracking-wider text-muted">Capped</span>
                            </div>
                          ) : (
                            <div className="flex items-center bg-surface-raised text-muted px-2 py-0.5 rounded-md border border-border">
                              <span className="text-[9px] font-bold uppercase mr-1 text-muted/70">XP</span>
                              <span className="text-[11px] font-bold">{(pkm.currentXp || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Moves Section */}
                    <div className="w-full pt-3 border-t border-border grid grid-cols-2 gap-1.5">
                      {[0, 1, 2, 3].map(i => {
                        const move = pkm.equippedMoves?.find((m: { slot: number; move: MoveDto }) => m.slot === i)?.move;
                        return (
                          <div key={i} className="bg-surface-raised px-2.5 py-1.5 rounded-xl border border-border/80 flex items-center gap-2 overflow-hidden h-8">
                            {move ? (
                              <>
                                <img src={getTypeSpriteUrl(move.type, true)} alt={move.type} className="h-3.5 w-auto object-contain shrink-0" />
                                <span className="font-bold text-foreground capitalize text-xs truncate w-full">{move.name.replace('-', ' ')}</span>
                              </>
                            ) : (
                              <>
                                <div className="w-3 h-3 rounded-full border border-border opacity-40 shrink-0 mx-0.5"></div>
                                <span className="text-muted italic text-[10px] uppercase tracking-wider">- Empty -</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 h-40 flex flex-col items-center justify-center gap-1">
                    <span className="text-2xl text-muted/40 font-light">+</span>
                    <span className="text-muted font-bold uppercase tracking-wider text-xs">Empty Party Slot</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 1. Options Menu Modal --- */}
      {activeMenuPkm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/50 backdrop-blur-sm" onClick={() => setActiveMenuPkm(null)}>
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md flex flex-col shadow-2xl pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
              <img
                src={getSpriteUrl(activeMenuPkm.speciesId)}
                className="w-12 h-12 bg-surface-raised rounded-lg object-contain pixelated border border-border"
              />
              <div>
                <h3 className="font-bold capitalize text-foreground">{activeMenuPkm.nickname || activeMenuPkm.species?.name}</h3>
                <p className="text-xs font-bold text-subtle">
                  Lv. {activeMenuPkm.level}
                  {activeMenuPkm.potential && activeMenuPkm.level >= getMaxLevelForPotential(activeMenuPkm.potential as string) ? (
                    <span className="font-bold text-foreground ml-1 uppercase text-[10px]">Capped</span>
                  ) : (
                    <span className="font-medium text-muted opacity-80 ml-1">• {activeMenuPkm.currentXp.toLocaleString()} XP</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setDetailsPkm(activeMenuPkm); setActiveMenuPkm(null); }}
                className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground"
              >
                View Details
              </button>

              <button
                onClick={() => handleMoveUp(activeMenuPkm)}
                disabled={activeMenuPkm.position === 0 || swapMutation.isPending}
                className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Move Up
              </button>

              <button
                onClick={() => handleMoveDown(activeMenuPkm)}
                disabled={activeMenuPkm.position === 5 || swapMutation.isPending}
                className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Move Down
              </button>

              <button
                onClick={() => {
                  navigate(`/pokemon/${activeMenuPkm.id}/moves`, { state: { pokemon: activeMenuPkm } });
                  setActiveMenuPkm(null);
                }}
                className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground"
              >
                Change Moves
              </button>
              {(() => {
                if (activeMenuPkm.species?.isMega || activeMenuPkm.species?.isGmax) {
                  return (
                    <button
                      onClick={() => devolveMutation.mutate(activeMenuPkm.id)}
                      disabled={devolveMutation.isPending}
                      className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground"
                    >
                      {devolveMutation.isPending ? 'Devolving...' : 'Devolve'}
                    </button>
                  );
                }

                const hasEvolutions = activeMenuPkm.species?.evolvesTo?.length > 0;
                const hasMegaForms = speciesInfo?.megas?.length > 0;
                const hasGmaxForms = speciesInfo?.gmaxes?.length > 0;
                const canEvolve = hasEvolutions || hasMegaForms || hasGmaxForms;
                return (
                  <button
                    onClick={() => {
                      if (!canEvolve) return;
                      const transformations = [
                        ...(activeMenuPkm.species?.evolvesTo || []).map((e: any) => ({ id: e.id, name: e.name, isStandard: true })),
                        ...(speciesInfo?.megas || []), 
                        ...(speciesInfo?.gmaxes || [])
                      ];
                      setEvolutionPkm({ ...activeMenuPkm, megas: transformations });
                      setSelectedMega(transformations[0] || null);
                      setActiveMenuPkm(null);
                    }}
                    disabled={!canEvolve}
                    className={`w-full text-center px-4 py-3 rounded-xl font-bold transition-colors ${canEvolve ? 'bg-surface-raised hover:bg-surface-raised text-foreground' : 'bg-surface-raised/50 text-muted cursor-not-allowed'}`}
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
                  className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground"
                >
                  Boost Potential
                </button>
              )}

              <button
                onClick={() => {
                  setGiveXpPkm(activeMenuPkm);
                  setXpAmountInput('1000');
                  setActiveMenuPkm(null);
                }}
                className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground flex items-center justify-center gap-1.5"
              >
                Give XP
              </button>

              <button
                onClick={() => {
                  setBoostIvPkm(activeMenuPkm);
                  setActiveMenuPkm(null);
                }}
                className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground"
              >
                Enhance IVs
              </button>

              <button
                onClick={() => removeMutation.mutate(activeMenuPkm.id)}
                disabled={party.length <= 1 || removeMutation.isPending}
                className="w-full text-center px-4 py-3 bg-surface-raised hover:bg-surface-raised rounded-xl font-bold transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removeMutation.isPending ? 'Removing...' : 'Remove From Team'}
              </button>
            </div>

            <button
              onClick={() => setActiveMenuPkm(null)}
              className="mt-4 pt-4 border-t border-border text-sm font-bold text-subtle hover:text-subtle w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- 2. Details Modal --- */}
      {detailsPkm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/50 backdrop-blur-sm" onClick={() => setDetailsPkm(null)}>
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto flex flex-col shadow-2xl pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={getSpriteUrl(detailsPkm.speciesId)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-raised rounded-xl object-contain pixelated border border-border shrink-0"
                />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground capitalize">
                    {detailsPkm.nickname || detailsPkm.species?.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded font-bold border border-border bg-surface-raised text-foreground">
                      Lv. {detailsPkm.level}
                    </span>
                    {detailsPkm.potential && (
                      <span className={getPotentialBadgeClasses(detailsPkm.potential)}>
                        {formatPotential(detailsPkm.potential)}
                      </span>
                    )}
                    {detailsPkm.potential && detailsPkm.level >= getMaxLevelForPotential(detailsPkm.potential as string) && (
                      <span className="text-xs px-2 py-1 rounded font-bold border border-border/50 bg-surface-raised text-foreground uppercase tracking-wider">
                        Capped
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailsPkm(null)} className="text-muted hover:text-subtle text-xl min-w-[44px] min-h-[44px] flex items-center justify-center">✕</button>
            </div>

            <div className="w-full">

              {/* Stats section */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">Stats Overview</h3>
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-surface-raised/50 text-muted text-xs uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3">Stat</th>
                        <th className="px-4 py-3 text-center">Base</th>
                        <th className="px-4 py-3 text-center">IV</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { label: 'HP', stat: calculateHP(detailsPkm.species.hp, detailsPkm.ivHp || 0, detailsPkm.level, detailsPkm.species.isGmax), iv: detailsPkm.ivHp || 0, base: detailsPkm.species.hp },
                        { label: 'Attack', stat: calculateStat(detailsPkm.species.attack, detailsPkm.ivAttack || 0, detailsPkm.level), iv: detailsPkm.ivAttack || 0, base: detailsPkm.species.attack },
                        { label: 'Defense', stat: calculateStat(detailsPkm.species.defense, detailsPkm.ivDefense || 0, detailsPkm.level), iv: detailsPkm.ivDefense || 0, base: detailsPkm.species.defense },
                        { label: 'Sp. Atk', stat: calculateStat(detailsPkm.species.spAtk, detailsPkm.ivSpAtk || 0, detailsPkm.level), iv: detailsPkm.ivSpAtk || 0, base: detailsPkm.species.spAtk },
                        { label: 'Sp. Def', stat: calculateStat(detailsPkm.species.spDef, detailsPkm.ivSpDef || 0, detailsPkm.level), iv: detailsPkm.ivSpDef || 0, base: detailsPkm.species.spDef },
                        { label: 'Speed', stat: calculateStat(detailsPkm.species.speed, detailsPkm.ivSpeed || 0, detailsPkm.level), iv: detailsPkm.ivSpeed || 0, base: detailsPkm.species.speed },
                      ].map(s => (
                        <tr key={s.label} className="hover:bg-surface-raised transition-colors">
                          <td className="px-4 py-2 text-muted">{s.label}</td>
                          <td className="px-4 py-2 text-center text-muted">{s.base}</td>
                          <td className="px-4 py-2 text-center text-muted">{s.iv}</td>
                          <td className="px-4 py-2 text-right text-muted">{s.stat}</td>
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

      {/* --- 3. Move Management Modal (Unchanged structurally, just uses new state) --- */}
      {/* --- 4. Evolution Modal --- */}
      {evolutionPkm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/50 backdrop-blur-sm" onClick={() => !evolveMutation.isPending && setEvolutionPkm(null)}>
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-8 w-full max-w-md max-h-[90dvh] overflow-y-auto flex flex-col shadow-2xl relative text-center pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="absolute inset-0 bg-linear-to-br from-surface to-surface-raised pointer-events-none rounded-t-3xl sm:rounded-2xl" />

            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-6 relative z-10 tracking-widest uppercase">
              Evolution
            </h2>
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface-raised/50 rounded-full flex items-center justify-center border border-border shadow-inner">
                  <img src={getSpriteUrl(evolutionPkm.speciesId)} className="w-16 h-16 sm:w-20 sm:h-20 pixelated object-contain opacity-80" />
                </div>
                <span className="mt-2 sm:mt-3 font-bold text-muted capitalize text-xs sm:text-sm">{evolutionPkm.nickname || evolutionPkm.species.name}</span>
              </div>

              <div className="flex flex-col items-center justify-center text-foreground animate-pulse">
                <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2" strokeWidth={2.5} />
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Evolves To</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-surface-raised/80 rounded-full flex items-center justify-center border-2 border-border shadow-lg relative">
                  {evolutionPkm.megas?.length && evolutionPkm.megas.length > 1 && (
                    <div className="absolute -top-3 -right-3 flex gap-1">
                      {evolutionPkm.megas.map((mega: { id: number, name: string, baseSpeciesId?: number, baseSpeciesName?: string, isGmax?: boolean, isStandard?: boolean }) => (
                        <button
                          key={mega.id}
                          onClick={() => setSelectedMega(mega)}
                          className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 ${selectedMega?.id === mega.id ? 'border-border bg-surface-raised text-foreground' : 'border-border bg-primary text-subtle'} text-[10px] font-bold flex items-center justify-center shadow-md`}
                        >
                          {mega.isStandard ? 'E' : (mega.isGmax ? 'G' : (mega.name.endsWith(' x') ? 'X' : (mega.name.endsWith(' y') ? 'Y' : 'M')))}
                        </button>
                      ))}
                    </div>
                  )}
                  <img src={getSpriteUrl(selectedMega?.id || evolutionPkm.species.evolvesTo?.[0]?.id || 0)} className="w-20 h-20 sm:w-24 sm:h-24 pixelated object-contain" />
                </div>
                <span className="mt-2 sm:mt-3 font-black text-foreground capitalize text-base sm:text-lg drop-shadow-sm">
                  {selectedMega ? selectedMega.name : (evolutionPkm.species.evolvesTo?.[0]?.name || '???')}
                </span>
              </div>
            </div>

            <div className="bg-surface-raised/50 rounded-xl p-4 mb-6 sm:mb-8 border border-border relative z-10">
              {(() => {
                let canPerformEvolution = false;
                let isUnlocked = false;
                let targetId = selectedMega ? selectedMega.id : (evolutionPkm.species.evolvesTo?.[0]?.id || 0);
                if (selectedMega && !selectedMega.isStandard) {
                  isUnlocked = ((save as any)?.unlockedForms || []).includes(targetId);
                  canPerformEvolution = isUnlocked;
                } else if (evolutionPkm.species.evolveByBattle) {
                  isUnlocked = ((save as any)?.unlockedForms || []).includes(targetId);
                  canPerformEvolution = isUnlocked;
                } else if (selectedMega?.isStandard || evolutionPkm.species.evolvesTo?.length > 0) {
                  canPerformEvolution = Boolean(evolutionPkm.species.evolutionLevel && evolutionPkm.level >= evolutionPkm.species.evolutionLevel);
                }

                const isBattleRequirement = (selectedMega && !selectedMega.isStandard) || evolutionPkm.species.evolveByBattle;

                return (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="text-lg sm:text-xl font-black text-foreground capitalize">{isBattleRequirement ? 'Battle Unlock Requirement' : `Level ${evolutionPkm.species.evolutionLevel}`}</span>
                      <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-surface border border-border ${canPerformEvolution ? 'text-foreground' : 'text-foreground'}`}>
                        {isBattleRequirement ? (isUnlocked ? 'Unlocked' : 'Challenge to Unlock') : `(Current Level: ${evolutionPkm.level})`}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 relative z-10 mt-6">
                      <button
                        onClick={() => { setEvolutionPkm(null); setSelectedMega(null); }}
                        disabled={evolveMutation.isPending}
                        className="px-6 py-3 font-bold text-muted hover:text-subtle bg-surface-raised hover:bg-surface-raised border border-border rounded-xl transition-all disabled:opacity-50 min-h-[44px]"
                      >
                        Cancel
                      </button>

                      {isBattleRequirement && !isUnlocked ? (
                        <button
                          onClick={() => {
                            engageMutation.mutate({ speciesId: targetId || evolutionPkm.speciesId, level: evolutionPkm.level, battleType: 'EVOLVE' });
                          }}
                          disabled={engageMutation.isPending}
                          className="px-8 py-3 font-black tracking-widest text-foreground rounded-xl shadow-glow transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none bg-linear-to-r from-surface to-surface-raised hover:from-surface hover:to-surface-raised hover:shadow-glow min-h-[44px]"
                        >
                          {engageMutation.isPending ? 'ENGAGING...' : 'FIGHT'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (selectedMega) {
                              evolveMutation.mutate({ pokemonId: evolutionPkm.id, targetSpeciesId: selectedMega.id });
                            } else if (evolutionPkm.species.evolvesTo?.length > 0) {
                              evolveMutation.mutate({ pokemonId: evolutionPkm.id, targetSpeciesId: evolutionPkm.species.evolvesTo[0].id });
                            }
                          }}
                          disabled={!canPerformEvolution || evolveMutation.isPending}
                          className={`px-8 py-3 font-black tracking-widest text-foreground rounded-xl shadow-glow transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none min-h-[44px] ${canPerformEvolution ? 'bg-linear-to-r from-surface to-surface-raised hover:from-surface hover:to-surface-raised hover:shadow-glow' : 'bg-surface-raised'}`}
                        >
                          {evolveMutation.isPending ? 'EVOLVING...' : canPerformEvolution ? 'EVOLVE!' : 'CANNOT EVOLVE'}
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {SmeltResultUI}

      {/* --- 5. Boost Potential Modal --- */}
      {boostPkm && (() => {
        const potentialMap: Record<string, { next: string, item: string, itemName: string }> = {
          'F': { next: 'E', item: 'e-pearl', itemName: 'E Pearl' },
          'E': { next: 'D', item: 'd-pearl', itemName: 'D Pearl' },
          'D': { next: 'C', item: 'c-pearl', itemName: 'C Pearl' },
          'C': { next: 'B', item: 'b-pearl', itemName: 'B Pearl' },
          'B': { next: 'A', item: 'a-pearl', itemName: 'A Pearl' },
          'A': { next: 'S_MINUS', item: 's-minus-pearl', itemName: 'S- Pearl' },
          'S_MINUS': { next: 'S', item: 's-pearl', itemName: 'S Pearl' },
          'S': { next: 'S_PLUS', item: 's-plus-pearl', itemName: 'S+ Pearl' },
          'S_PLUS': { next: 'SS_MINUS', item: 'ss-minus-pearl', itemName: 'SS- Pearl' },
          'SS_MINUS': { next: 'SS', item: 'ss-pearl', itemName: 'SS Pearl' },
          'SS': { next: 'SS_PLUS', item: 'ss-plus-pearl', itemName: 'SS+ Pearl' },
          'SS_PLUS': { next: 'SSS_MINUS', item: 'sss-minus-pearl', itemName: 'SSS- Pearl' },
          'SSS_MINUS': { next: 'SSS', item: 'sss-pearl', itemName: 'SSS Pearl' },
          'SSS': { next: 'SSS_PLUS', item: 'sss-plus-pearl', itemName: 'SSS+ Pearl' },
          'SSS_PLUS': { next: 'EX', item: 'ex-pearl', itemName: 'EX Pearl' },
        };
        const mapping = potentialMap[boostPkm.potential || ''];
        const ownedCrystal = save?.inventory?.find((i: InventoryItemDto) => i.itemId === mapping?.item);
        const hasCrystal = ownedCrystal && ownedCrystal.quantity > 0;

        const defaultTheme = { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised', textGradient: 'from-surface to-surface-raised', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' };
        const themeMap: Record<string, typeof defaultTheme> = {
          'E': defaultTheme,
          'D': defaultTheme,
          'C': defaultTheme,
          'B': defaultTheme,
          'A': defaultTheme,
          'S_MINUS': defaultTheme,
          'S': defaultTheme,
          'S_PLUS': defaultTheme,
          'SS_MINUS': defaultTheme,
          'SS': defaultTheme,
          'SS_PLUS': defaultTheme,
          'SSS_MINUS': defaultTheme,
          'SSS': defaultTheme,
          'SSS_PLUS': defaultTheme,
          'EX': { border: 'border-foreground', shadow: 'shadow-glow-lg', bgGradient: 'from-surface to-surface-raised', textGradient: 'from-surface to-surface-raised', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-primary text-primary-foreground', buttonHover: 'hover:bg-primary/90' },
        };
        const theme = themeMap[mapping?.next] || defaultTheme;

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/50 backdrop-blur-sm" onClick={() => !boostMutation.isPending && setBoostPkm(null)}>
            <div className={`bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-8 w-full max-w-md max-h-[90dvh] overflow-y-auto flex flex-col shadow-2xl relative text-center pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200`} onClick={e => e.stopPropagation()}>
              <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
              <div className={`absolute inset-0 bg-linear-to-br ${theme.bgGradient} pointer-events-none rounded-t-3xl sm:rounded-2xl`} />

              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-6 relative z-10 tracking-widest uppercase">
                Boost Potential
              </h2>

              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8 relative z-10">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface-raised rounded-full flex items-center justify-center border border-border shadow-inner">
                    <img src={getSpriteUrl(boostPkm.speciesId)} className="w-16 h-16 sm:w-20 sm:h-20 pixelated object-contain opacity-80" />
                  </div>
                  <span className="mt-2 sm:mt-3 font-bold text-muted capitalize text-xs sm:text-sm">{(boostPkm.potential || '').replace('_', ' ')}</span>
                </div>

                <div className={`flex flex-col items-center justify-center ${theme.arrow} animate-pulse`}>
                  <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2" strokeWidth={2.5} />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Upgrades To</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className={`w-22 h-22 sm:w-28 sm:h-28 bg-surface/80 rounded-full flex items-center justify-center border-2 ${theme.border} shadow-lg`}>
                    <img src={getSpriteUrl(boostPkm.speciesId)} className="w-18 h-18 sm:w-24 sm:h-24 pixelated object-contain drop-shadow-glow" />
                  </div>
                  <span className={`mt-2 sm:mt-3 font-bold capitalize text-base sm:text-lg tracking-wide text-transparent bg-clip-text bg-linear-to-r ${theme.textGradient}`}>{mapping?.next.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="bg-surface-raised/50 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 relative z-10 border border-border">
                <h4 className="text-xs uppercase font-bold text-muted tracking-wider mb-2 sm:mb-3">Required Item</h4>
                <div className="flex flex-col items-center">
                  <span className="text-lg sm:text-xl font-black text-foreground">{mapping?.itemName}</span>
                  <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-surface border border-border ${hasCrystal ? 'text-foreground' : 'text-foreground'}`}>
                    In Bag: {ownedCrystal?.quantity || 0}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 relative z-10">
                <button
                  onClick={() => setBoostPkm(null)}
                  disabled={boostMutation.isPending}
                  className="px-6 py-3 font-bold text-muted hover:bg-surface-raised rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  Cancel
                </button>

                {hasCrystal && (
                  <button
                    onClick={() => boostMutation.mutate({ pokemonId: boostPkm.id, itemId: mapping.item })}
                    disabled={boostMutation.isPending}
                    className={`px-8 py-3 font-black tracking-widest text-foreground ${theme.buttonBg} ${theme.buttonHover} rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed min-h-[44px]`}
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
          { key: 'ivAttack', label: 'ATK' },
          { key: 'ivDefense', label: 'DEF' },
          { key: 'ivSpAtk', label: 'SPA' },
          { key: 'ivSpDef', label: 'SPD' },
          { key: 'ivSpeed', label: 'SPE' }
        ];

        const ownedCrystal = save?.inventory?.find((i: InventoryItemDto) => i.itemId === requiredItemId);
        const hasCrystal = ownedCrystal && ownedCrystal.quantity > 0;

        const isMaxed = isGold
          ? statOptions.every(opt => (boostIvPkm[opt.key as keyof OwnedPokemonDto] as number) >= 31)
          : (boostIvPkm[selectedIvStat as keyof OwnedPokemonDto] as number) >= 31;

        const statKey = selectedIvStat as keyof OwnedPokemonDto;
        const currentIv = Number(boostIvPkm[statKey]) || 0;

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/50 backdrop-blur-sm" onClick={() => !boostIvMutation.isPending && setBoostIvPkm(null)}>
            <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-8 w-full max-w-lg max-h-[90dvh] overflow-y-auto flex flex-col shadow-2xl relative text-center pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200" onClick={e => e.stopPropagation()}>
              <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
              <div className="absolute inset-0 bg-linear-to-br from-surface to-surface-raised pointer-events-none rounded-t-3xl sm:rounded-2xl" />

              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-6 relative z-10 tracking-widest uppercase">
                Enhance IVs
              </h2>

              <div className="relative z-10 mb-4 sm:mb-6 flex justify-center gap-2 sm:gap-4 bg-surface-raised p-1.5 rounded-xl border border-border shadow-inner">
                <button
                  onClick={() => setSelectedIvItem('bottle-cap')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all min-h-[44px] flex items-center justify-center ${!isGold ? 'bg-surface text-foreground shadow-sm border border-border' : 'text-subtle hover:text-muted border border-transparent'}`}
                >
                  Bottle Cap
                </button>
                <button
                  onClick={() => setSelectedIvItem('gold-bottle-cap')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all min-h-[44px] flex items-center justify-center ${isGold ? 'bg-surface text-foreground shadow-sm border border-border' : 'text-subtle hover:text-muted border border-transparent'}`}
                >
                  Gold Bottle Cap
                </button>
              </div>

              {!isGold && (
                <div className="relative z-10 mb-4 sm:mb-6 grid grid-cols-3 sm:flex sm:justify-center flex-wrap gap-2">
                  {statOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedIvStat(opt.key)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-colors min-h-[44px] flex items-center justify-center ${selectedIvStat === opt.key ? 'bg-surface-raised text-foreground border-border shadow-md' : 'bg-surface text-muted border-border hover:bg-surface-raised '}`}
                    >
                      {opt.label}: {Number(boostIvPkm[opt.key as keyof OwnedPokemonDto])} / 31
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8 relative z-10">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-muted text-xs sm:text-sm">
                    {isGold ? 'All IVs' : 'Current IV'}
                  </span>
                  <span className="font-black text-foreground text-2xl sm:text-3xl">{isGold ? 'VARIES' : currentIv}</span>
                </div>

                {!isMaxed && (
                  <div className="flex flex-col items-center justify-center text-foreground animate-pulse">
                    <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
                  </div>
                )}

                {!isMaxed && (
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-foreground text-xs sm:text-sm">
                      {isGold ? 'All IVs' : 'Next IV'}
                    </span>
                    <span className="font-black text-foreground text-2xl sm:text-3xl">31</span>
                  </div>
                )}
                {isMaxed && (
                  <div className="flex flex-col items-center justify-center ml-4 sm:ml-8">
                    <span className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-widest drop-shadow-md">MAXED!</span>
                  </div>
                )}
              </div>

              {!isMaxed && (
                <div className="bg-surface-raised/50 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 relative z-10 border border-border">
                  <h4 className="text-xs uppercase font-bold text-muted tracking-wider mb-2 sm:mb-3">Required Item</h4>
                  <div className="flex flex-col items-center">
                    <span className="text-lg sm:text-xl font-black text-foreground">{requiredItemName}</span>
                    <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-surface border border-border ${hasCrystal ? 'text-foreground' : 'text-foreground'}`}>
                      In Bag: {ownedCrystal?.quantity || 0}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 relative z-10">
                <button
                  onClick={() => setBoostIvPkm(null)}
                  disabled={boostIvMutation.isPending}
                  className="px-6 py-3 font-bold text-muted hover:bg-surface-raised rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  Cancel
                </button>

                {!isMaxed && hasCrystal && (
                  <button
                    onClick={() => boostIvMutation.mutate({ pokemonId: boostIvPkm.id, itemId: requiredItemId, stat: selectedIvStat })}
                    disabled={boostIvMutation.isPending}
                    className="px-8 py-3 font-black tracking-widest text-foreground bg-surface-raised hover:bg-surface-raised rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed min-h-[44px]"
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
        const maxLvl = getMaxLevelForPotential(giveXpPkm.potential as string);
        const maxTotalXp = getXpForLevel(maxLvl + 1) - 1;
        const neededXp = Math.max(0, maxTotalXp - (giveXpPkm.currentXp || 0));
        const storedXp = save?.storedXp || 0;
        const maxAllowed = Math.min(storedXp, neededXp);

        const addedAmount = parseInt(xpAmountInput || '0', 10);
        const newTotalXp = (giveXpPkm.currentXp || 0) + (isNaN(addedAmount) ? 0 : addedAmount);
        const previewLvl = getLevelFromXp(newTotalXp);

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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/50 backdrop-blur-sm" onClick={() => setGiveXpPkm(null)}>
            <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto flex flex-col shadow-2xl pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200" onClick={e => e.stopPropagation()}>
              <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
              <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
                <img
                  src={getSpriteUrl(giveXpPkm.speciesId)}
                  className="w-14 h-14 bg-surface-raised rounded-xl object-contain pixelated border border-border shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg capitalize text-foreground">{giveXpPkm.nickname || giveXpPkm.species?.name}</h3>
                  <p className="text-xs font-bold text-subtle">
                    Lv. {giveXpPkm.level} {addedAmount > 0 && <span className="text-foreground font-extrabold">→ Lv. {previewLvl}</span>} • {newTotalXp.toLocaleString()} XP (Cap: Lv. {maxLvl})
                  </p>
                </div>
              </div>

              <div className="bg-surface p-3 rounded-xl mb-4 border border-border flex justify-between items-center text-sm">
                <span className="font-semibold text-muted">Your Stored XP:</span>
                <span className="font-black text-foreground flex items-center gap-1.5">
                  <img src="/xp.webp" alt="XP" className="w-4 h-4 object-contain" />
                  {save?.storedXp?.toLocaleString() || 0} XP
                </span>
              </div>

              <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-2">
                Amount of XP to Give:
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={xpAmountInput}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                  const capped = Math.min(maxAllowed, val);
                  setXpAmountInput(capped > 0 ? capped.toString() : '');
                }}
                placeholder="Enter XP amount"
                className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl font-bold text-base sm:text-lg mb-3 text-foreground focus:outline-none focus:ring-2 focus:ring-border min-h-[44px]"
              />

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-1.5 mb-6">
                {[1000, 5000, 25000, 100000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAddXp(amt)}
                    className="py-2.5 px-2 bg-surface-raised hover:bg-surface-raised border border-border rounded-lg text-xs font-bold text-muted transition-colors min-h-[44px] flex items-center justify-center"
                  >
                    +{amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
                <button
                  onClick={handleMaxXp}
                  className="py-2.5 px-2 bg-surface-raised hover:bg-surface-raised border border-border/60 rounded-lg text-xs font-black text-foreground transition-colors uppercase tracking-wider min-h-[44px] flex items-center justify-center"
                >
                  Max
                </button>
              </div>

              {distributeXpMutation.isError && (
                <p className="text-sm font-bold text-foreground mb-4 text-center">
                  {(distributeXpMutation.error as unknown as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to distribute XP'}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setGiveXpPkm(null)}
                  className="flex-1 py-3 bg-surface-raised hover:bg-surface-raised text-foreground rounded-xl font-bold transition-colors min-h-[44px]"
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
                  className="flex-1 py-3 bg-surface-raised hover:bg-surface-raised text-foreground rounded-xl font-bold transition-colors shadow-lg shadow-glow disabled:opacity-50 min-h-[44px]"
                >
                  {distributeXpMutation.isPending ? 'Giving XP...' : 'Give XP'}
                </button>
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
