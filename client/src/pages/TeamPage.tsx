import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function TeamPage() {
  const queryClient = useQueryClient();
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);

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
      setSelectedPokemon(null);
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Team Data...</div>;
  }

  const party = save?.party || [];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
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
                className={`relative rounded-2xl overflow-hidden border transition-colors ${pkm ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 shadow-lg' : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30 shadow-sm dark:shadow-none'}`}
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

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-sm">
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">HP</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivHp}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">ATK</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivAttack}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">DEF</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivDefense}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">SPA</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivSpAtk}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">SPD</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivSpDef}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">SPE</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivSpeed}</span>
                        </div>
                      </div>
                      
                      {/* Moves Section */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Moves</h4>
                          <button 
                            onClick={() => setSelectedPokemon({ ...pkm, currentMoves: [pkm.move1, pkm.move2, pkm.move3, pkm.move4].map(m => m || 'tackle') })}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 dark:text-blue-300 px-2 py-1 rounded transition-colors"
                          >
                            Change Moves
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[pkm.move1, pkm.move2, pkm.move3, pkm.move4].map((m, idx) => (
                            <div key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded capitalize border border-slate-200 dark:border-slate-700 truncate">
                              {m || '-'}
                            </div>
                          ))}
                        </div>
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

      {/* Move Management Modal */}
      {selectedPokemon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                Change {selectedPokemon.nickname || selectedPokemon.species?.name}'s Moves
              </h2>
              <button 
                onClick={() => setSelectedPokemon(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Current Moves */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Current Moves</h3>
                {selectedPokemon.currentMoves.map((m: string, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 capitalize font-medium flex items-center justify-between">
                      {m}
                      <button 
                        onClick={() => {
                          const newMoves = [...selectedPokemon.currentMoves];
                          newMoves[idx] = ''; // clear slot to indicate editing
                          setSelectedPokemon({ ...selectedPokemon, currentMoves: newMoves, editingSlot: idx });
                        }}
                        className="text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-2 py-1 rounded"
                      >
                        Swap
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Move Selection */}
              <div className="flex flex-col gap-2 overflow-y-auto pr-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">
                  {selectedPokemon.editingSlot !== undefined ? 'Select a move...' : 'Select "Swap" on a slot first'}
                </h3>
                {selectedPokemon.editingSlot !== undefined && allMoves?.map((move: any) => (
                  <button 
                    key={move.name}
                    onClick={() => {
                      const newMoves = [...selectedPokemon.currentMoves];
                      newMoves[selectedPokemon.editingSlot] = move.name;
                      setSelectedPokemon({ ...selectedPokemon, currentMoves: newMoves, editingSlot: undefined });
                    }}
                    className="flex flex-col p-3 rounded-lg border border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400 bg-white dark:bg-slate-800 text-left transition-colors"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold capitalize">{move.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold border border-slate-300 dark:border-slate-600`}>
                        {move.type.name}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
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
                onClick={() => setSelectedPokemon(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => changeMovesMutation.mutate({ pokemonId: selectedPokemon.id, moves: selectedPokemon.currentMoves.filter(Boolean) })}
                disabled={changeMovesMutation.isPending || selectedPokemon.editingSlot !== undefined}
                className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
              >
                {changeMovesMutation.isPending ? 'Saving...' : 'Save Moves'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
