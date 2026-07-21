'use client';
import { useState, useRef } from 'react';
import { PokemonModalsRef } from '../../../features/pokemon/ui/PokemonActionModals';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../../../shared/api/api';
import { toast } from 'sonner';
import { PokemonActionModals } from '../../../features/pokemon/ui/PokemonActionModals';

export function PokemonManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedForTeam, setSelectedForTeam] = useState<string | null>(null);
  const [activeMenuPkm, setActiveMenuPkm] = useState<any>(null);
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
      const { data } = await api.get(`/trainers/pokemon?page=${page}&limit=20`);
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
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to remove from team');
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
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to add to team');
    }
  });

  const releaseMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.delete(`/trainers/${pokemonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      toast.success('Pokémon released!');
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
  const totalPages = Math.ceil(total / 20) || 1;

  const activePartyIds = new Set(save?.party?.map((p: any) => p.id) || []);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-3xl font-black tracking-tight">My Pokémon</h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl disabled:opacity-50 font-bold"
            >
              Prev
            </button>
            <span className="font-bold">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl disabled:opacity-50 font-bold"
            >
              Next
            </button>
          </div>
        </div>

        
        {allPokemon.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">You don't have any Pokémon yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {allPokemon.map((p: any) => {
              const inParty = activePartyIds.has(p.id) || p.isParty;
              return (
                <div key={p.id} className={`relative bg-white dark:bg-slate-900 border ${inParty ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-200 dark:border-slate-800'} rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-row`}>
                  
                  {inParty && (
                    <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider z-10">
                      In Party
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center flex-1 min-w-0 pr-4 border-r border-slate-200 dark:border-slate-700">
                    <div className="w-24 h-24 relative mb-2">
                      <img src={getSpriteUrl(p.speciesId)} alt={p.name || p.speciesName} className="w-full h-full object-contain drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <h3 className="font-extrabold text-xl capitalize text-slate-900 dark:text-white truncate w-full text-center">{p.name || p.speciesName}</h3>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-center gap-1">
                      <span>Lv. {p.level}</span>
                      <span className="text-amber-500">★</span>
                      <span className={p.potential === 'DIAMOND' ? 'text-cyan-500' : p.potential === 'PLATINUM' ? 'text-slate-400' : p.potential === 'GOLD' ? 'text-amber-500' : 'text-slate-500'}>{p.potential}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 w-full mt-2 px-2">
                      {[0, 1, 2, 3].map(slot => {
                        const m = p.moves?.find((mv: any) => mv.slot === slot)?.move?.name;
                        return (
                          <div key={slot} className="text-[10px] sm:text-xs bg-slate-50 dark:bg-slate-800/80 px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-center font-bold text-slate-600 dark:text-slate-300 truncate capitalize">
                            {m ? m.replace('-', ' ') : '-'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                                <div className="flex flex-col gap-1.5 w-48 shrink-0 pl-4 justify-center">
                    <button
                      onClick={() => modalsRef.current?.openDetails(p)}
                      className="w-full py-1.5 px-3 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-center"
                    >
                      View Details
                    </button>
                    
                    <button
                      onClick={() => modalsRef.current?.openMoves(p)}
                      className="w-full py-1.5 px-3 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-center"
                    >
                      Change Moves
                    </button>

                    <button
                      onClick={() => modalsRef.current?.openEvolve(p)}
                      className="w-full py-1.5 px-3 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-center"
                    >
                      Evolution
                    </button>

                    <button
                      onClick={() => modalsRef.current?.openBoost(p)}
                      className="w-full py-1.5 px-3 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-center"
                    >
                      Boost Potential
                    </button>

                    <button
                      onClick={() => modalsRef.current?.openIVs(p)}
                      className="w-full py-1.5 px-3 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-center"
                    >
                      Enhance IVs
                    </button>

                    {inParty ? (
                      <button
                        disabled={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(p.id)}
                        className="w-full py-1.5 px-3 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors disabled:opacity-50 text-center"
                      >
                        Remove from Team
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedForTeam(p.id)}
                        className="w-full py-1.5 px-3 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-center"
                      >
                        Add to Team
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if(confirm('Are you sure you want to release this Pokémon?')) {
                          releaseMutation.mutate(p.id);
                        }
                      }}
                      className="w-full py-1.5 px-3 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors text-center"
                    >
                      Release
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        <PokemonActionModals 
          ref={modalsRef}
          activeMenuPkm={activeMenuPkm}
          setActiveMenuPkm={setActiveMenuPkm}
          save={save}
          allMoves={allMoves}
        />

        {/* Slot Selection Modal */}
        {selectedForTeam && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
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
                    {save?.party?.find((p: any) => p.position === slot) ? (
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
