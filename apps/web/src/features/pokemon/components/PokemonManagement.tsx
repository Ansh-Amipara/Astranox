import { useState, useRef } from 'react';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { OwnedPokemonDto } from '@astranox/types';
import { PokemonModalsRef } from './PokemonActionModals';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '@/shared/api/api';
import { PokemonActionModals } from '@/features/pokemon/components/PokemonActionModals';
import { Pagination } from '@/shared/ui/Pagination';
import { PokemonManagementCard } from './PokemonManagementCard';
import { useSmeltPokemon } from '@/features/pokemon/hooks/useSmeltPokemon';
import { getMaxLevelForPotential } from '@/features/pokemon/pokemonUtils';

export function PokemonManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedForTeam, setSelectedForTeam] = useState<string | null>(null);
  const [activeMenuPkm, setActiveMenuPkm] = useState<OwnedPokemonDto | null>(null);
  const modalsRef = useRef<PokemonModalsRef>(null);

  const { promptSmelt, isSmelting, SmeltResultUI } = useSmeltPokemon(() => setActiveMenuPkm(null));

  const { data: save } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  const { data: pokemonData, isLoading } = useQuery({
    queryKey: ['allPokemon', page],
    queryFn: async () => {
      const { data } = await api.get(`/trainers/pokemon?page=${page}&limit=15`);
      return data;
    },
  });

  const { data: allMoves } = useQuery({
    queryKey: ['allMoves'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/moves');
      return data.data;
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.post(`/trainers/party/${pokemonId}/remove`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      notify.success('Removed from team!');
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to remove from team');
    }
  });

  const addMutation = useMutation({
    mutationFn: async ({ pokemonId, position }: { pokemonId: string, position: number }) => {
      await api.post(`/trainers/party/${pokemonId}/add`, { position });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setSelectedForTeam(null);
      notify.success('Added to team!');
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to add to team');
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100dvh-64px)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border"></div>
      </div>
    );
  }

  const allPokemon = pokemonData?.data || [];
  const total = pokemonData?.meta?.total || 0;
  const totalPages = Math.ceil(total / 15) || 1;

  const activePartyIds = new Set(save?.party?.map((p: OwnedPokemonDto) => p.id) || []);
  const isInParty = (pokemon: OwnedPokemonDto) => activePartyIds.has(pokemon.id);

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">My Pokémon</h1>
            {total > 0 && (
              <span className="bg-surface-raised border border-border px-2.5 py-0.5 rounded-full text-xs font-bold text-muted shadow-xs">
                {total.toLocaleString()} total
              </span>
            )}
          </div>
        </div>

        {allPokemon.length === 0 ? (
          <div className="text-center p-8 sm:p-12 bg-surface rounded-3xl border border-dashed border-border shadow-xs">
            <p className="text-muted text-sm sm:text-base font-semibold">You don't have any Pokémon yet. Catch Pokémon in the Realm or obtain them from eggs and trades!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {allPokemon.map((p: OwnedPokemonDto) => (
              <PokemonManagementCard
                key={p.id}
                pokemon={p}
                inParty={isInParty(p)}
                onClick={setActiveMenuPkm}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center pt-6 sm:pt-8 pb-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        <PokemonActionModals
          ref={modalsRef}
          activeMenuPkm={null}
          setActiveMenuPkm={setActiveMenuPkm}
          save={save}
          allMoves={allMoves}
        />

        {/* Options Menu Modal */}
        {activeMenuPkm && (
          <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveMenuPkm(null)}>
            <div role="dialog" aria-modal="true" className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 w-full max-w-md max-h-[85dvh] overflow-y-auto flex flex-col shadow-2xl pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200" onClick={e => e.stopPropagation()}>
              <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
              <div className="flex items-center gap-3.5 mb-4 border-b border-border pb-4">
                <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center p-1 border border-border shadow-xs shrink-0">
                  <img
                    src={getSpriteUrl(activeMenuPkm.speciesId)}
                    alt={activeMenuPkm.speciesName}
                    className="w-10 h-10 object-contain pixelated"
                  />
                </div>
                <div>
                  <h3 className="font-bold capitalize text-foreground flex items-center gap-2">
                    {activeMenuPkm.nickname || (activeMenuPkm as unknown as { name?: string })?.name || activeMenuPkm.speciesName}
                    {activeMenuPkm.isBound && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-raised text-muted uppercase tracking-wider" title="This Pokémon is bound to your account and cannot be traded or sold">
                        🔒 Bound
                      </span>
                    )}
                  </h3>
                  <p className="text-xs font-bold text-muted">
                    Lv. {activeMenuPkm.level}
                    {activeMenuPkm.potential && activeMenuPkm.level >= getMaxLevelForPotential(activeMenuPkm.potential as string) ? (
                      <span className="font-bold text-muted ml-1 uppercase text-[10px] bg-surface-raised px-1.5 py-0.5 rounded-full border border-border">Capped</span>
                    ) : (
                      <span className="font-medium text-muted ml-1">• {(activeMenuPkm.currentXp || 0).toLocaleString()} XP</span>
                    )}
                  </p>
                </div>
              </div>

              {activeMenuPkm.isEscrowed ? (
                <div className="flex flex-col gap-2">
                  <div className="bg-surface-raised text-muted p-3.5 rounded-xl text-xs sm:text-sm font-semibold text-center border border-border">
                    This Pokémon is currently locked in a Marketplace trade or offer and cannot be modified.
                  </div>
                  <button
                    onClick={() => { modalsRef.current?.openDetails(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border shadow-xs flex items-center justify-center"
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { modalsRef.current?.openDetails(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border shadow-xs flex items-center justify-center text-xs sm:text-sm"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openMoves(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border shadow-xs flex items-center justify-center text-xs sm:text-sm"
                  >
                    Change Moves
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openEvolve(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border shadow-xs flex items-center justify-center text-xs sm:text-sm"
                  >
                    Evolution
                  </button>

                  {activeMenuPkm.potential !== 'ETERNAL' && (
                    <button
                      onClick={() => { modalsRef.current?.openBoost(activeMenuPkm); setActiveMenuPkm(null); }}
                      className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border shadow-xs flex items-center justify-center text-xs sm:text-sm"
                    >
                      Boost Potential
                    </button>
                  )}

                  <button
                    onClick={() => {
                      modalsRef.current?.openGiveXp(activeMenuPkm);
                      setActiveMenuPkm(null);
                    }}
                    className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border shadow-xs flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                  >
                    Give XP
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openIVs(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border shadow-xs flex items-center justify-center text-xs sm:text-sm"
                  >
                    Enhance IVs
                  </button>

                  {isInParty(activeMenuPkm) ? (
                    <button
                      disabled={removeMutation.isPending}
                      onClick={() => {
                        removeMutation.mutate(activeMenuPkm.id);
                        setActiveMenuPkm(null);
                      }}
                      className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-muted border border-border shadow-xs disabled:opacity-50 flex items-center justify-center text-xs sm:text-sm"
                    >
                      Remove from Team
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedForTeam(activeMenuPkm.id);
                        setActiveMenuPkm(null);
                      }}
                      className="w-full text-center px-4 py-2.5 min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20 rounded-xl font-bold shadow-xs transition-all active:scale-[0.98] flex items-center justify-center text-xs sm:text-sm"
                    >
                      Add to Team
                    </button>
                  )}

                  <button
                    onClick={() => promptSmelt(activeMenuPkm.id)}
                    disabled={isSmelting || isInParty(activeMenuPkm)}
                    title={isInParty(activeMenuPkm) ? "Cannot smelt a Pokémon that is currently in your party" : undefined}
                    className="w-full text-center px-4 py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised rounded-xl font-bold transition-all active:scale-[0.98] text-muted hover:text-foreground border border-border shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm"
                  >
                    {isSmelting ? 'Smelting...' : 'Smelt Pokemon'}
                  </button>
                </div>
              )}

              <button
                onClick={() => setActiveMenuPkm(null)}
                className="mt-4 pt-3 border-t border-border text-xs sm:text-sm font-bold text-muted hover:text-foreground w-full transition-colors min-h-[44px] flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Slot Selection Modal */}
        {selectedForTeam && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setSelectedForTeam(null)}>
            <div role="dialog" aria-modal="true" className="bg-surface text-foreground rounded-t-3xl sm:rounded-2xl p-5 sm:p-7 max-w-md w-full max-h-[85dvh] overflow-y-auto shadow-2xl border border-border pb-safe animate-in slide-in-from-bottom sm:zoom-in duration-200" onClick={e => e.stopPropagation()}>
              <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
              <h2 className="text-xl sm:text-2xl font-black mb-1 text-foreground tracking-tight">Select Team Slot</h2>
              <p className="text-xs sm:text-sm text-muted mb-5">Which party slot should this Pokémon occupy? (1–6)</p>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {[0, 1, 2, 3, 4, 5].map(slot => (
                  <button
                    key={slot}
                    onClick={() => addMutation.mutate({ pokemonId: selectedForTeam, position: slot })}
                    className="py-3 px-3.5 min-h-[44px] bg-surface hover:bg-surface-raised border border-border text-foreground font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-between touch-manipulation"
                  >
                    <span className="text-sm">Slot {slot + 1}</span>
                    {save?.party?.find((p: OwnedPokemonDto) => p.position === slot) ? (
                      <span className="text-[10px] text-muted bg-surface-raised px-2 py-0.5 rounded-full border border-border font-bold">Replace</span>
                    ) : (
                      <span className="text-[10px] text-foreground bg-surface-raised px-2 py-0.5 rounded-full border border-border font-bold">Empty</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedForTeam(null)}
                className="w-full py-2.5 min-h-[44px] bg-surface hover:bg-surface-raised text-muted hover:text-foreground font-bold rounded-xl transition-colors border border-border shadow-xs flex items-center justify-center text-sm touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {SmeltResultUI}
      </div>
    </div>
  );
}
