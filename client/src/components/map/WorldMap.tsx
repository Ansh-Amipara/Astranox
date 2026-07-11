import React, { useState } from 'react';
import { MapCard } from './MapCard';
import { RegionProgress } from './RegionProgress';

type GameMap = {
  id: string;
  name: string;
  theme: string;
  difficulty: number;
  mapImage: string | null;
  secretArea: boolean;
};

type Area = {
  id: string;
  name: string;
  description: string;
  areaType: string;
  gameMaps: GameMap[];
};

type Region = {
  id: string;
  name: string;
  description: string;
  areas: Area[];
};

type Continent = {
  id: string;
  name: string;
  description: string;
  regions: Region[];
};

type WorldData = {
  id: string;
  name: string;
  continents: Continent[];
};

interface WorldMapProps {
  worldData: WorldData[];
  onSelectMap: (mapId: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ worldData, onSelectMap }) => {
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(
    worldData[0]?.continents[0] || null
  );
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(
    worldData[0]?.continents[0]?.regions[0] || null
  );

  if (!worldData || worldData.length === 0) {
    return <div className="text-center text-white p-8">The world is still forming...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Continent Selector */}
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
        {worldData[0]?.continents.map(continent => (
          <button
            key={continent.id}
            onClick={() => {
              setSelectedContinent(continent);
              setSelectedRegion(continent.regions[0] || null);
            }}
            className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-300 ${
              selectedContinent?.id === continent.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
                : 'bg-black/40 text-gray-400 hover:bg-black/60 hover:text-white border border-white/5'
            }`}
          >
            {continent.name}
          </button>
        ))}
      </div>

      {selectedContinent && (
        <div className="flex flex-1 gap-6">
          
          {/* Region Sidebar */}
          <div className="w-64 flex flex-col space-y-3">
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm opacity-50">Regions</h2>
            {selectedContinent.regions.map(region => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region)}
                className={`text-left p-4 rounded-xl backdrop-blur-md transition-all duration-200 border ${
                  selectedRegion?.id === region.id
                    ? 'bg-white/10 border-indigo-500/50 shadow-inner'
                    : 'bg-black/30 border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="font-semibold text-white">{region.name}</div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-2">{region.description}</div>
              </button>
            ))}
          </div>

          {/* Area & Map Viewer */}
          <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-y-auto">
            {selectedRegion ? (
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                      {selectedRegion.name}
                    </h3>
                    <p className="text-gray-400 mt-2">{selectedRegion.description}</p>
                  </div>
                  <RegionProgress regionId={selectedRegion.id} />
                </div>

                {selectedRegion.areas.map(area => (
                  <div key={area.id} className="pt-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <h4 className="text-xl font-bold text-white">{area.name}</h4>
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 rounded-full text-gray-300">
                        {area.areaType}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {area.gameMaps.map(gameMap => (
                        <MapCard 
                          key={gameMap.id} 
                          gameMap={gameMap} 
                          onClick={() => onSelectMap(gameMap.id)} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Select a region to explore
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
};
