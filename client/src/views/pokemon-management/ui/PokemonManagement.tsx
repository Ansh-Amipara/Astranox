import { useState, useRef } from 'react';
import { PokemonModalsRef } from '../../../features/pokemon/ui/PokemonActionModals';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../../../shared/api/api';
import { getTypeSpriteUrl } from '../../../shared/api/axios';
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
                      <img src={p.species?.spriteUrl || p.spriteUrl || getSpriteUrl(p.speciesId)} alt={p.name || p.speciesName} className="w-full h-full object-contain drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    {/* Row 1: Name */}
                    <h3 className="font-extrabold text-xl capitalize text-slate-900 dark:text-white truncate w-full text-center">{p.name || p.speciesName}</h3>
                    
                    {/* Row 2: Type */}
                    <div className="mt-1 flex items-center justify-center gap-1 mb-2">
                      {p.species?.type1 && (
                        <img src={getTypeSpriteUrl(p.species.type1.name, false)} alt={p.species.type1.name} title={p.species.type1.name} className="h-5 w-auto object-contain drop-shadow-sm" />
                      )}
                      {p.species?.type2 && (
                        <img src={getTypeSpriteUrl(p.species.type2.name, false)} alt={p.species.type2.name} title={p.species.type2.name} className="h-5 w-auto object-contain drop-shadow-sm" />
                      )}
                    </div>

                    {/* Row 3: Potential and CP */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                      <span className={
                        'text-[10px] font-bold uppercase px-2 py-0.5 rounded border tracking-wider ' + 
                        (p.potential === 'DIAMOND' ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800' : 
                         p.potential === 'PLATINUM' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700' : 
                         p.potential === 'GOLD' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 
                         'bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-slate-200 dark:border-slate-700')
                      }>
                        ★ {p.potential}
                      </span>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-wider">
                        CP {p.cp?.toLocaleString() || 0}
                      </span>
                    </div>

                    {/* Row 4: Level and XP */}
                    <div className="flex items-center justify-center gap-2 mb-2 w-full">
                      <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/50">
                        <span className="text-[10px] font-bold uppercase mr-1 opacity-70">Lv.</span>
                        <span className="text-xs font-black">{p.level}</span>
                      </div>
                      {p.potential && p.level >= ({ BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200, DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 600, SOVEREIGN: 700, LEGENDARY: 800, DIVINE: 900, CELESTIAL: 1000, PRIMORDIAL: 1200, MYTHICAL: 1400, INFINITY: 1700, ETERNAL: 2000 }[p.potential as string] || 2000) ? (
                        <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/50">
                          <span className="text-[9px] font-bold uppercase tracking-widest">Capped</span>
                        </div>
                      ) : (
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold uppercase mr-1 opacity-70">XP</span>
                          <span className="text-xs font-bold">{(p.currentXp || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1 w-full mt-1 px-2">
                      {[0, 1, 2, 3].map(slot => {
                        const mv = p.moves?.find((m: any) => m.slot === slot)?.move;
                        return (
                          <div key={slot} className="flex items-center justify-start gap-1 text-[10px] sm:text-xs bg-slate-50 dark:bg-slate-800/80 px-1.5 py-1 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {mv ? (
                              <>
                                <img src={getTypeSpriteUrl(mv.type, true)} alt={mv.type} title={mv.type} className="h-3.5 w-auto object-contain shrink-0" />
                                <span className="font-bold text-slate-600 dark:text-slate-300 truncate capitalize">{mv.name.replace('-', ' ')}</span>
                              </>
                            ) : (
                              <span className="text-center w-full text-slate-400 dark:text-slate-500 font-bold">-</span>
                            )}
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
