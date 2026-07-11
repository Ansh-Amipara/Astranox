import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GameMap {
  id: string;
  theme?: string;
  difficulty?: number;
}

interface Area {
  id: string;
  name: string;
  gameMaps: GameMap[];
}

interface MacroRegion {
  id: string;
  name: string;
  imageUrl?: string;
  areas: Area[];
}

interface MacroContinent {
  id: string;
  regions: MacroRegion[];
}

interface MacroWorld {
  continents: MacroContinent[];
}

interface MapCollageProps {
  world: MacroWorld;
}

export const MapCollage: React.FC<MapCollageProps> = ({ world }) => {
  const navigate = useNavigate();

  // Flatten out all regions from all continents
  const allRegions: MacroRegion[] = world.continents.flatMap(c => c.regions);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#ccc] p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-black mb-8 border-b-2 border-black pb-2 font-mono">
          Astranox World Map
        </h1>
        
        <div className="flex flex-wrap gap-8 items-start justify-center">
          {allRegions.map(region => (
            <div 
              key={region.id} 
              className="relative border-4 border-black bg-black group"
              style={{ width: '400px', height: '400px' }}
            >
              {/* Region Background Image */}
              <img 
                src={region.imageUrl!} 
                alt={region.name} 
                className="absolute inset-0 w-full h-full object-cover image-rendering-pixelated"
              />
              
              {/* Retro Grid Overlay - Let's do a 2x2 grid for authentic look */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-50 pointer-events-none">
                <div className="border-r-2 border-b-2 border-black"></div>
                <div className="border-b-2 border-black"></div>
                <div className="border-r-2 border-black"></div>
                <div className=""></div>
              </div>

              {/* Clickable Area Overlays */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <h3 className="text-white font-bold text-2xl mb-4 font-mono">{region.name}</h3>
                
                <div className="flex flex-col gap-2 w-3/4">
                  {region.areas.flatMap(a => a.gameMaps).map((map) => (
                    <button
                      key={map.id}
                      onClick={() => navigate(`/map/${map.id}`)}
                      className="bg-white/10 hover:bg-white/30 border border-white/30 text-white font-mono px-4 py-2 rounded shadow-lg backdrop-blur-sm transition-all"
                    >
                      {map.difficulty ? '⭐'.repeat(map.difficulty) : ''} {map.theme || 'Zone'}
                    </button>
                  ))}
                  {region.areas.flatMap(a => a.gameMaps).length === 0 && (
                    <div className="text-gray-400 font-mono text-sm italic">Under Construction</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
