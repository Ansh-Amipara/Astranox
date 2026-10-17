import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { OwnedPokemonDto, MoveDto } from '@astranox/types';;
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

  if (isLoading) {
    return (
      <div className="flex-1 bg-black text-white p-4 md:p-6 min-h-[calc(100vh-64px)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const allPokemon = pokemonData?.data || [];
  const total = pokemonData?.meta?.total || 0;
  const totalPages = Math.ceil(total / 15) || 1;

  const activePartyIds = new Set(save?.party?.map((p: OwnedPokemonDto) => p.id) || []);
  const isInParty = (pokemon: OwnedPokemonDto) => activePartyIds.has(pokemon.id);

  return (
    <div className="flex-1 bg-black text-white p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h1 className="text-3xl font-black tracking-tight">My Pokémon</h1>
        </div>


        {allPokemon.length === 0 ? (
          <div className="text-center p-12 bg-neutral-950 rounded-3xl border border-neutral-800">
            <p className="text-neutral-500">You don't have any Pokémon yet.</p>
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
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setActiveMenuPkm(null)}>
            <div role="dialog" aria-modal="true" className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 w-full max-w-md flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-4 border-b border-neutral-800 pb-4">
                <img
                  src={getSpriteUrl(activeMenuPkm.speciesId)}
                  className="w-12 h-12 bg-neutral-900 rounded-lg object-contain pixelated border border-neutral-800"
                />
                <div>
                  <h3 className="font-bold capitalize text-white flex items-center gap-2">
                    {activeMenuPkm.nickname || (activeMenuPkm as unknown as { name?: string })?.name || activeMenuPkm.speciesName}
                    {activeMenuPkm.isBound && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 uppercase tracking-wider" title="This Pokémon is bound to your account and cannot be traded or sold">
                        🔒 Bound
                      </span>
                    )}
                  </h3>
                  <p className="text-xs font-bold text-neutral-400">
                    Lv. {activeMenuPkm.level}
                    {activeMenuPkm.potential && activeMenuPkm.level >= getMaxLevelForPotential(activeMenuPkm.potential as string) ? (
                      <span className="font-bold text-neutral-300 ml-1 uppercase text-[10px] bg-neutral-800 px-1 py-0.5 rounded">Capped</span>
                    ) : (
                      <span className="font-medium text-neutral-500 opacity-80 ml-1">• {(activeMenuPkm.currentXp || 0).toLocaleString()} XP</span>
                    )}
                  </p>
                </div>
              </div>

              {activeMenuPkm.isEscrowed ? (
                <div className="flex flex-col gap-2">
                  <div className="bg-neutral-900 text-neutral-300 p-3 rounded-xl text-sm font-bold text-center border border-neutral-800">
                    This Pokémon is currently locked in a Marketplace trade or offer and cannot be modified.
                  </div>
                  <button
                    onClick={() => { modalsRef.current?.openDetails(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-white border border-neutral-800"
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { modalsRef.current?.openDetails(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-white border border-neutral-800"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openMoves(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-white border border-neutral-800"
                  >
                    Change Moves
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openEvolve(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-white border border-neutral-800"
                  >
                    Evolution
                  </button>

                  {activeMenuPkm.potential !== 'ETERNAL' && (
                    <button
                      onClick={() => { modalsRef.current?.openBoost(activeMenuPkm); setActiveMenuPkm(null); }}
                      className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-white border border-neutral-800"
                    >
                      Boost Potential
                    </button>
                  )}

                  <button
                    onClick={() => {
                      modalsRef.current?.openGiveXp(activeMenuPkm);
                      setActiveMenuPkm(null);
                    }}
                    className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-white border border-neutral-800 flex items-center justify-center gap-1.5"
                  >
                    Give XP
                  </button>

                  <button
                    onClick={() => { modalsRef.current?.openIVs(activeMenuPkm); setActiveMenuPkm(null); }}
                    className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-white border border-neutral-800"
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
                      className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-neutral-300 border border-neutral-800 disabled:opacity-50"
                    >
                      Remove from Team
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedForTeam(activeMenuPkm.id);
                        setActiveMenuPkm(null);
                      }}
                      className="w-full text-center px-4 py-3 bg-white hover:bg-neutral-200 text-black rounded-xl font-bold transition-colors border border-white"
                    >
                      Add to Team
                    </button>
                  )}

                  <button
                    onClick={() => promptSmelt(activeMenuPkm.id)}
                    disabled={isSmelting || isInParty(activeMenuPkm)}
                    title={isInParty(activeMenuPkm) ? "Cannot smelt a Pokémon that is currently in your party" : undefined}
                    className="w-full text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold transition-colors text-neutral-400 hover:text-white border border-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSmelting ? 'Smelting...' : 'Smelt Pokemon'}
                  </button>
                </div>
              )}

              <button
                onClick={() => setActiveMenuPkm(null)}
                className="mt-4 pt-4 border-t border-neutral-800 text-sm font-bold text-neutral-400 hover:text-white w-full transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Slot Selection Modal */}
        {selectedForTeam && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div role="dialog" aria-modal="true" className="bg-neutral-950 text-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-neutral-800">
              <h2 className="text-2xl font-black mb-2 text-white">Select Team Slot</h2>
              <p className="text-neutral-400 mb-6">Which slot should this Pokémon take? (1-6)</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[0, 1, 2, 3, 4, 5].map(slot => (
                  <button
                    key={slot}
                    onClick={() => addMutation.mutate({ pokemonId: selectedForTeam, position: slot })}
                    className="py-3 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Slot {slot + 1}</span>
                    {save?.party?.find((p: OwnedPokemonDto) => p.position === slot) ? (
                      <span className="text-xs text-neutral-300 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">Replace</span>
                    ) : (
                      <span className="text-xs text-white bg-neutral-800 px-2 py-1 rounded border border-neutral-600 font-bold">Empty</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedForTeam(null)}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold rounded-xl transition-colors border border-neutral-800"
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
