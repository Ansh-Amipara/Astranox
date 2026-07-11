import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export function AdminMap() {
  const queryClient = useQueryClient();
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  
  // Form State
  const [speciesId, setSpeciesId] = useState<number>(1);
  const [minLevel, setMinLevel] = useState<number>(1);
  const [maxLevel, setMaxLevel] = useState<number>(5);
  const [spawnRate, setSpawnRate] = useState<number>(10);
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);

  const { data: speciesList } = useQuery({
    queryKey: ['adminSpecies'],
    queryFn: async () => {
      const { data } = await api.get('/admin/species');
      return data.data;
    }
  });

  const { data: mapsData, isLoading } = useQuery({
    queryKey: ['adminMaps'],
    queryFn: async () => {
      const { data } = await api.get('/admin/maps');
      return data.data;
    }
  });

  const addSpawnMutation = useMutation({
    mutationFn: async (payload: { mapId: string, speciesId: number, minLevel: number, maxLevel: number, spawnRate: number }) => {
      return api.post(`/admin/maps/${payload.mapId}/spawns`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMaps'] });
      alert('Spawn added successfully');
    },
    onError: (err: any) => {
      alert(`Error: ${err.response?.data?.error?.message || err.message}`);
    }
  });

  const deleteSpawnMutation = useMutation({
    mutationFn: async (spawnId: string) => {
      return api.delete(`/admin/spawns/${spawnId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMaps'] });
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center font-bold text-2xl">Loading World Builder...</div>;
  }

  const selectedMap = mapsData?.find((m: any) => m.id === selectedMapId);

  return (
    <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
        World Builder
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Map List */}
        <div className="lg:w-1/3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto max-h-[800px]">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Game Maps</h2>
          <div className="space-y-3">
            {mapsData?.map((map: any) => (
              <button
                key={map.id}
                onClick={() => setSelectedMapId(map.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedMapId === map.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-lg">{map.name}</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                  {map.area?.region?.name} &gt; {map.area?.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Map Editor */}
        <div className="lg:w-2/3">
          {selectedMap ? (
            <div className="space-y-6">
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedMap.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <span>{selectedMap.area?.region?.continent?.name}</span>
                      <span>•</span>
                      <span>{selectedMap.area?.region?.name}</span>
                      <span>•</span>
                      <span>{selectedMap.area?.name}</span>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-sm border border-slate-200 dark:border-slate-700">
                    Theme: {selectedMap.theme}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Spawn Form */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      Add Spawn Entry
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Pokémon Species</label>
                        <input
                          type="text"
                          value={speciesSearch}
                          onFocus={() => setShowSpeciesDropdown(true)}
                          onChange={(e) => {
                            setSpeciesSearch(e.target.value);
                            setShowSpeciesDropdown(true);
                          }}
                          placeholder="Search Pokémon..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        {showSpeciesDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                            {speciesList
                              ?.filter((s: any) => s.name.toLowerCase().includes(speciesSearch.toLowerCase()) || s.id.toString() === speciesSearch)
                              .map((s: any) => (
                                <div
                                  key={s.id}
                                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-blue-600 cursor-pointer text-slate-900 dark:text-white capitalize text-sm font-medium flex justify-between"
                                  onClick={() => {
                                    setSpeciesId(s.id);
                                    setSpeciesSearch(s.name);
                                    setShowSpeciesDropdown(false);
                                  }}
                                >
                                  <span>{s.name}</span>
                                  <span className="text-slate-500 dark:text-slate-400 text-xs">#{s.id}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Min Level</label>
                          <input
                            type="text"
                            value={minLevel || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setMinLevel(val ? Number(val) : 1);
                            }}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Max Level</label>
                          <input
                            type="text"
                            value={maxLevel || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setMaxLevel(val ? Number(val) : 1);
                            }}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Spawn Rate (1-100)</label>
                        <input
                          type="text"
                          value={spawnRate || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setSpawnRate(val ? Number(val) : 1);
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        onClick={() => addSpawnMutation.mutate({ mapId: selectedMap.id, speciesId, minLevel, maxLevel, spawnRate })}
                        disabled={addSpawnMutation.isPending || !speciesId}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                      >
                        Add Spawn Entry
                      </button>
                    </div>
                  </div>

                  {/* Spawn List */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      Current Encounters
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {selectedMap.spawnGroups?.map((group: any) => (
                        <div key={group.id} className="mb-4">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{group.name}</h4>
                          <div className="space-y-2">
                            {group.entries.map((enc: any) => (
                              <div key={enc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                  <img src={enc.species.spriteUrl} alt={enc.species.name} className="w-10 h-10 rendering-pixelated" />
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-white capitalize">{enc.species.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                      Lv {enc.minLevel}-{enc.maxLevel} • {enc.spawnRate}%
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Delete this encounter?')) {
                                      deleteSpawnMutation.mutate(enc.id);
                                    }
                                  }}
                                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl min-h-[600px] text-slate-400 dark:text-slate-500 font-bold text-xl">
              Select a Game Map to edit
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
