import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';

type Species = {
  id: number;
  name: string;
  spriteUrl: string;
};

type ZoneEncounter = {
  id: number;
  species: Species;
  encounterRate: number;
};

type Zone = {
  id: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  encounters: ZoneEncounter[];
};

type Habitat = {
  id: number;
  name: string;
  zones: Zone[];
};

export function MapPage() {
  const [activeEncounter, setActiveEncounter] = useState<any | null>(null);
  const [exploreMessage, setExploreMessage] = useState<string>('');

  const { data: habitats, isLoading } = useQuery({
    queryKey: ['habitats'],
    queryFn: async () => {
      const { data } = await api.get('/map/zones');
      return data.data as Habitat[];
    },
  });

  const exploreMutation = useMutation({
    mutationFn: async (zoneId: number) => {
      const { data } = await api.post('/map/explore', { zoneId });
      return data.data;
    },
    onSuccess: (data) => {
      if (data.encounter) {
        setActiveEncounter(data.encounter);
        setExploreMessage(`A wild ${data.encounter.species.name} appeared!`);
      } else {
        setActiveEncounter(null);
        setExploreMessage('You explored the area but found nothing.');
      }
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Map Data...</div>;
  }

  return (
    <div className="flex-1 bg-slate-950 p-8 text-slate-100 min-h-screen relative">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          World Map
        </h1>

        {exploreMessage && !activeEncounter && (
          <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
            {exploreMessage}
          </div>
        )}

        <div className="space-y-12">
          {habitats?.map((habitat) => (
            <div key={habitat.id} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-2xl font-bold mb-6 text-white capitalize flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                {habitat.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habitat.zones.map((zone) => (
                  <div key={zone.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg hover:border-slate-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-slate-200">{zone.name}</h3>
                      <span className="text-xs font-bold bg-slate-950 text-slate-400 px-2 py-1 rounded">
                        Lv. {zone.minLevel} - {zone.maxLevel}
                      </span>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Possible Encounters</p>
                      <div className="flex flex-wrap gap-2">
                        {zone.encounters.map(enc => (
                          <span key={enc.id} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded capitalize">
                            {enc.species.name} ({(enc.encounterRate * 100).toFixed(0)}%)
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => exploreMutation.mutate(zone.id)}
                      disabled={exploreMutation.isPending}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      {exploreMutation.isPending ? 'Exploring...' : 'Explore Area'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wild Encounter Modal */}
      {activeEncounter && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl transform transition-all">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Wild Pokémon Appeared!</h2>
            <p className="text-slate-300 mb-6">{exploreMessage}</p>
            
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700 inline-block">
              <img 
                src={`http://localhost:3000/sprites/${activeEncounter.species.id}.png`} 
                alt={activeEncounter.species.name}
                className="w-32 h-32 object-contain mx-auto drop-shadow-xl"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="mt-4">
                <h3 className="text-xl font-bold text-white capitalize">{activeEncounter.species.name}</h3>
                <span className="text-sm font-bold text-blue-400">Lv. {activeEncounter.level}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                onClick={() => {
                  setActiveEncounter(null);
                  setExploreMessage('');
                }}
              >
                Run Away
              </button>
              <button 
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors cursor-not-allowed opacity-50"
                title="Battle Engine coming in Phase 8!"
              >
                Engage (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
