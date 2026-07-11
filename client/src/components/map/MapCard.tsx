import React from 'react';

type GameMap = {
  id: string;
  name: string;
  theme: string;
  difficulty: number;
  mapImage: string | null;
  secretArea: boolean;
};

interface MapCardProps {
  gameMap: GameMap;
  onClick: () => void;
}

export const MapCard: React.FC<MapCardProps> = ({ gameMap, onClick }) => {
  // Map themes to gradient backgrounds for visual flair
  const getThemeGradient = (theme: string) => {
    switch (theme.toLowerCase()) {
      case 'forest': return 'from-emerald-900 to-green-800';
      case 'volcano': return 'from-red-900 to-orange-800';
      case 'cave': return 'from-stone-900 to-stone-800';
      case 'water': return 'from-blue-900 to-cyan-800';
      case 'city': return 'from-gray-800 to-gray-700';
      case 'grassland': return 'from-green-800 to-lime-800';
      default: return 'from-gray-800 to-slate-800';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(Math.min(5, difficulty)) + '☆'.repeat(Math.max(0, 5 - difficulty));
  };

  return (
    <div 
      onClick={onClick}
      className={`relative group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br ${getThemeGradient(gameMap.theme)} border border-white/10 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl h-40`}
    >
      {/* Optional Background Image */}
      {gameMap.mapImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500"
          style={{ backgroundImage: `url(${gameMap.mapImage})` }}
        />
      )}
      
      {/* Glassmorphism overlay for content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
        
        <div className="flex justify-between items-end">
          <div>
            <h5 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
              {gameMap.name}
            </h5>
            <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mt-1">
              {gameMap.theme}
            </div>
          </div>
          
          <div className="text-yellow-400 text-sm tracking-widest" title={`Difficulty: ${gameMap.difficulty}`}>
            {getDifficultyStars(gameMap.difficulty)}
          </div>
        </div>

        {gameMap.secretArea && (
          <div className="absolute top-3 right-3">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
