import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api/api';
import { Swords } from 'lucide-react';
import academyData from '../../../shared/data/academy.json';

// Utility to get a simple sprite URL from species name
// Note: This relies on PokeAPI sprites by name.
const getPokemonSprite = (name: string) => {
  if (!name) return '';
  let cleanName = name.toLowerCase().replace(/ /g, '').replace(/[^a-z0-9-]/g, '');
  if (cleanName === 'mr.-mime') cleanName = 'mrmime';
  if (cleanName === 'mr.-rime') cleanName = 'mrrime';
  return `https://play.pokemonshowdown.com/sprites/gen5/${cleanName}.png`;
};

export function AcademyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const filterRanks = ['D', 'C', 'B', 'A', 'S-', 'S', 'S+', 'SS-', 'SS'];
  const [activeRank, setActiveRank] = useState(filterRanks[0]);
  const [error, setError] = useState<string | null>(null);

  const challengeMutation = useMutation({
    mutationFn: (npcName: string) => api.post('/battles/academy-encounter', { npcName }),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['battleSession'] });
      navigate('/battle');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to start battle');
    }
  });
  
  const allNpcs = academyData.flatMap(section => section.npcs);
  const filteredNpcs = allNpcs.filter(npc => npc.rank.split(' ')[0] === activeRank);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        {/* Header and Controls section */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            {/* Left Side: Title & Filter */}
            <div className="flex flex-col gap-6 w-full md:w-auto">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Academy
              </h1>

              {/* Category Filter */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto w-full sm:w-max">
                {filterRanks.map(rank => (
                  <button
                    key={rank}
                    onClick={() => setActiveRank(rank)}
                    className={`px-4 py-2 rounded-md text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                      activeRank === rank
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Rank {rank}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-800/50">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 pb-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Rank {activeRank}</h2>
            <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-lg font-bold text-slate-500 text-sm shadow-sm">
              {filteredNpcs.length} Members
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNpcs.map((npc, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-blue-500 transition-colors flex flex-col relative group">
                    
                    {/* Header */}
                    <div className="p-5 flex flex-col items-center border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
                      <div className="w-24 h-24 mb-3 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden shrink-0 relative">
                         {npc.ace ? (
                            <img src={getPokemonSprite(npc.ace)} alt={npc.ace} className="w-full h-full object-contain drop-shadow-md pixelated scale-125 hover:scale-150 transition-transform" />
                         ) : (
                            <span className="text-slate-400 font-bold text-xs uppercase">No Ace</span>
                         )}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white text-center leading-tight mb-1">{npc.name}</h3>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 text-center uppercase tracking-wider">{npc.title}</p>
                    </div>

                    {/* Stats & Rank */}
                    <div className="p-4 flex flex-col gap-4 flex-1 justify-between">
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rank & Level</span>
                          <span className="font-black text-slate-700 dark:text-slate-200">{npc.rank}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rewards</span>
                          <span className="font-bold text-slate-600 dark:text-slate-300 text-xs">{(npc.coins / 1000).toFixed(0)}k C / {(npc.xp / 1000).toFixed(0)}k XP</span>
                        </div>
                      </div>

                      <button
                        onClick={() => challengeMutation.mutate(npc.name)}
                        disabled={challengeMutation.isPending}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-black rounded-xl shadow-lg shadow-red-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Swords className="w-5 h-5" />
                        <span>{challengeMutation.isPending ? 'Preparing...' : 'Challenge'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
      </div>
    </div>
  );
}
