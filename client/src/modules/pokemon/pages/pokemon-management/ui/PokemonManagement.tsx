import { useState, useRef } from 'react';
import { OwnedPokemonDto, MoveDto } from '@astranox/shared';
import { PokemonModalsRef } from '@/modules/pokemon/components/ui/PokemonActionModals';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { getPotentialBadgeClasses } from '@/shared/utils/pokemonUtils';
import { toast } from 'sonner';
import { PokemonActionModals } from '@/modules/pokemon/components/ui/PokemonActionModals';
import { Pagination } from '@/shared/ui/Pagination';
import { PokemonManagementCard } from './PokemonManagementCard';

export function PokemonManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedForTeam, setSelectedForTeam] = useState<string | null>(null);
  const [activeMenuPkm, setActiveMenuPkm] = useState<OwnedPokemonDto | null>(null);
  const modalsRef = useRef<PokemonModalsRef>(null);

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
      toast.success('Removed from team!');
    },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to remove from team');
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
      toast.success('Added to team!');
    },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to add to team');
    }
  });

  const smeltMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      const { data } = await api.post(`/trainers/party/${pokemonId}/smelt`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });

      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold">Smelt Successful!</p>
          <p className="text-sm">Gained {data.storedXp.toLocaleString()} Stored XP</p>
          {data.pearls.length > 0 && (
            <div className="text-sm mt-1">
              <p className="font-semibold">Pearls Obtained:</p>
              <ul className="list-disc list-inside">
                {data.pearls.map((p: { quantity?: number; type?: string }, i: number) => (
                  <li key={i}>{p.quantity}x {p.type} Pearl</li>
                ))}
              </ul>
            </div>
          )}
        </div>,
        { duration: 5000 }
      );
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const allPokemon = pokemonData?.data || [];
  const total = pokemonData?.meta?.total || 0;
  const totalPages = Math.ceil(total / 15) || 1;

  const activePartyIds = new Set(save?.party?.map((p: OwnedPokemonDto) => p.id) || []);
  const isInParty = (pokemon: OwnedPokemonDto) => activePartyIds.has(pokemon.id);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-3xl font-black tracking-tight">My Pokémon</h1>
        </div>


        {allPokemon.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">You don't have any Pokémon yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <div className="flex justify-center pt-8 pb-4">
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
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setActiveMenuPkm(null)}>
            <div role="dialog" aria-modal="true" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 w-full max-w-md flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <img
                  src={getSpriteUrl(activeMenuPkm.speciesId)}
                  className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg object-contain pixelated border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-bold capitalize text-slate-900 dark:text-white flex items-center gap-2">
                    {activeMenuPkm.nickname || (activeMenuPkm as unknown as { name?: string })?.name || activeMenuPkm.speciesName}
                    {activeMenuPkm.isBound && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wider" title="This Pokémon is bound to your account and cannot be traded or sold">
                        🔒 Bound
                      </span>
                    )}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Lv. {activeMenuPkm.level}
                    {activeMenuPkm.potential && activeMenuPkm.level >= ({ BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200, DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 700, SOVEREIGN: 900, LEGENDARY: 1100, DIVINE: 1400, CELESTIAL: 1700, PRIMORDIAL: 2000, MYTHICAL: 3000, INFINITY: 4000, ETERNAL: 5000 }[activeMenuPkm.potential as string] || 5000) ? (
                      <span className="font-bold text-red-500 ml-1 uppercase text-[10px]">Capped</span>
                    ) : (
                      <span className="font-medium text-slate-400 opacity-80 ml-1">• {(activeMenuPkm.currentXp || 0).toLocaleString()} XP</span>
                    )}
                  </p>
                </div>
              </div>

              {activeMenuPkm.isEscrowed ? (
                <div className="flex flex-col gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 p-3 rounded-xl text-sm font-bold text-center border border-purple-200 dark:border-purple-800/50">
                    This Pokémon is currently locked in a Marketplace trade or offer and cannot be modified.
                  </div>
                  <button
                    onClick={() => { modalsRef.current?.openDetails(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { modalsRef.current?.openDetails(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openMoves(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                  >
                    Change Moves
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openEvolve(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                  >
                    Evolution
                  </button>

                  {activeMenuPkm.potential !== 'ETERNAL' && (
                    <button
                      onClick={() => { modalsRef.current?.openBoost(activeMenuPkm); setActiveMenuPkm(null); }}
                      className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                    >
                      Boost Potential
                    </button>
                  )}

                  <button
                    onClick={() => {
                      modalsRef.current?.openGiveXp(activeMenuPkm);
                      setActiveMenuPkm(null);
                    }}
                    className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white flex items-center justify-center gap-1.5"
                  >
                    Give XP
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openIVs(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
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
                      className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                    >
                      Remove from Team
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedForTeam(activeMenuPkm.id);
                        setActiveMenuPkm(null);
                      }}
                      className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                    >
                      Add to Team
                    </button>
                  )}

                  <button
                    onClick={() => {
                      toast(`Smelting permanently destroys this Pokémon.\nYou will receive Stored XP and Potential Pearls.\nThis action cannot be undone.`, {
                        action: {
                          label: 'Smelt',
                          onClick: () => {
                            smeltMutation.mutate(activeMenuPkm.id);
                            setActiveMenuPkm(null);
                          }
                        },
                        cancel: {
                          label: 'Cancel',
                          onClick: () => { }
                        },
                        duration: 5000
                      });
                    }}
                    disabled={smeltMutation.isPending || isInParty(activeMenuPkm)}
                    title={isInParty(activeMenuPkm) ? "Cannot smelt a Pokémon that is currently in your party" : undefined}
                    className="w-full text-center px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {smeltMutation.isPending ? 'Smelting...' : 'Smelt Pokemon'}
                  </button>
                </div>
              )}

              <button
                onClick={() => setActiveMenuPkm(null)}
                className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Slot Selection Modal */}
        {selectedForTeam && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div role="dialog" aria-modal="true" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-black mb-2">Select Team Slot</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Which slot should this Pokémon take? (1-6)</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[0, 1, 2, 3, 4, 5].map(slot => (
                  <button
                    key={slot}
                    onClick={() => addMutation.mutate({ pokemonId: selectedForTeam, position: slot })}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Slot {slot + 1}</span>
                    {save?.party?.find((p: OwnedPokemonDto) => p.position === slot) ? (
                      <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded">Replace</span>
                    ) : (
                      <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">Empty</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedForTeam(null)}
                className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
