import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export function AdminMap() {
  const queryClient = useQueryClient();
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  
  // Form State
  const [speciesId, setSpeciesId] = useState<number | ''>('');
  const [encounterRate, setEncounterRate] = useState<number>(10);
  const [minIv, setMinIv] = useState<number>(0);
  const [maxIv, setMaxIv] = useState<number>(31);
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);

  const { data: speciesList } = useQuery({
    queryKey: ['adminSpecies'],
    queryFn: async () => {
      const { data } = await api.get('/admin/species');
      return data.data;
    }
  });

  const { data: zonesData, isLoading } = useQuery({
    queryKey: ['adminZones'],
    queryFn: async () => {
      const { data } = await api.get('/admin/zones');
      return data.data;
    }
  });

  const addEncounterMutation = useMutation({
    mutationFn: async (payload: { zoneId: number, speciesId: number, encounterRate: number, minIv: number, maxIv: number }) => {
      return api.post(`/admin/zones/${payload.zoneId}/encounters`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminZones'] });
      setSpeciesId('');
      setSpeciesSearch('');
      setEncounterRate(10);
      setMinIv(0);
      setMaxIv(31);
    }
  });

  const deleteEncounterMutation = useMutation({
    mutationFn: async (encounterId: number) => {
      return api.delete(`/admin/encounters/${encounterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminZones'] });
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center font-bold text-2xl">Loading Map Data...</div>;
  }

  const selectedZone = zonesData?.find((z: any) => z.id === selectedZoneId);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Map Management</h1>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Zone List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Zones</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[600px] overflow-y-auto">
            {zonesData?.map((zone: any) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedZoneId === zone.id ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500' : 'border-l-4 border-transparent'}`}
              >
                <div className="font-bold text-slate-900 dark:text-white">{zone.name}</div>
                <div className="text-xs text-slate-500 mt-1">Level: {zone.minLevel} - {zone.maxLevel}</div>
                <div className="text-xs text-slate-400 mt-1">Habitat: {zone.habitat?.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Encounter Management */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {selectedZone ? (
            <>
              {/* Encounters List */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Encounters in {selectedZone.name}
                </h3>
                
                {selectedZone.encounters?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedZone.encounters.map((enc: any) => (
                      <div key={enc.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-4">
                          <img 
                            src={`http://localhost:3000/sprites/${enc.speciesId}.png`} 
                            className="w-12 h-12 pixelated object-contain"
                          />
                          <div>
                            <div className="font-bold capitalize text-slate-900 dark:text-white">{enc.species?.name}</div>
                            <div className="text-xs text-slate-500 font-medium">Rate: {enc.encounterRate}%</div>
                            <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded mt-1 inline-block">
                              IV Range: {enc.minIv} - {enc.maxIv}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteEncounterMutation.mutate(enc.id)}
                          disabled={deleteEncounterMutation.isPending}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove Encounter"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No encounters assigned to this zone yet.
                  </div>
                )}
              </div>

              {/* Add Encounter Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Encounter</h3>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!speciesId) return;
                    addEncounterMutation.mutate({
                      zoneId: selectedZone.id,
                      speciesId: Number(speciesId),
                      encounterRate,
                      minIv,
                      maxIv
                    });
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-1 relative">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Pokémon Species</label>
                    <input 
                      type="text" 
                      value={speciesSearch}
                      onFocus={() => setShowSpeciesDropdown(true)}
                      onChange={(e) => {
                        setSpeciesSearch(e.target.value);
                        setShowSpeciesDropdown(true);
                      }}
                      placeholder="Search Pokémon..."
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
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
                  
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Encounter Rate (%)</label>
                    <input 
                      type="text"
                      required
                      value={encounterRate || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setEncounterRate(val ? parseFloat(val) : 0);
                      }}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Min IV</label>
                    <input 
                      type="text"
                      required
                      value={minIv === 0 ? '0' : (minIv || '')}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setMinIv(val ? parseInt(val) : 0);
                      }}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Max IV</label>
                    <input 
                      type="text"
                      required
                      value={maxIv === 0 ? '0' : (maxIv || '')}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setMaxIv(val ? parseInt(val) : 0);
                      }}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button 
                      type="submit"
                      disabled={addEncounterMutation.isPending || !speciesId}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-sm transition-colors"
                    >
                      {addEncounterMutation.isPending ? 'Adding...' : 'Add Encounter to Zone'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <span className="text-4xl mb-4">🗺️</span>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Zone Selected</h3>
              <p className="text-slate-500 mt-2">Select a zone from the list to manage its wild Pokémon encounters.</p>
            </div>
          )}
          
        </div>
      </div>
      </div>
      <style>{`.pixelated { image-rendering: pixelated; }`}</style>
    </div>
  );
}
