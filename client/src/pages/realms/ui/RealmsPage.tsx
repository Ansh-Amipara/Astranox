'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { realmsApi } from '../../../shared/api/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Realm {
  id: string;
  name: string;
  tier: number;
  requiredRank: string;
  isUnlocked: boolean;
  minLevel: number;
  maxLevel: number;
  bossSpeciesId: number;
  bossSpeciesName: string;
  types: string[];
}

export function RealmsPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: realms, isLoading } = useQuery({
    queryKey: ['realms'],
    queryFn: realmsApi.getRealms,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Connecting to the Astral Realms...</div>;
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'from-stone-300/20 to-orange-600/20 border-orange-500/50'; // Black Iron
      case 2: return 'from-amber-700/20 to-orange-800/20 border-orange-900/50'; // Bronze
      case 3: return 'from-slate-300/20 to-slate-500/20 border-slate-400/50'; // Silver
      case 4: return 'from-yellow-400/20 to-yellow-600/20 border-yellow-500/50'; // Gold
      case 5: return 'from-cyan-400/20 to-blue-600/20 border-cyan-500/50'; // Platinum
      case 6: return 'from-purple-400/20 to-indigo-600/20 border-purple-500/50'; // Diamond
      case 7: return 'from-rose-400/20 to-red-600/20 border-rose-500/50'; // Epic
      case 8: return 'from-amber-300/30 via-orange-500/30 to-red-600/30 border-amber-400'; // Legendary
      default: return 'from-slate-400/20 to-slate-600/20 border-slate-500/50';
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4">
          Astral Realms
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Mystical dimensions that overlap Lunaris. Higher Trainer Ranks allow you to delve deeper into these realms to find rare items, wealth, and incredibly powerful Pokémon.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        
        {/* Tier Filter */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2 rounded-md text-sm font-bold capitalize whitespace-nowrap transition-colors ${
              selectedTier === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            All Tiers
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-colors ${
                selectedTier === tier
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Tier {tier}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-500">Element:</span>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer w-full md:w-48 capitalize"
          >
            <option value="all">All Types</option>
            {Array.from(new Set(realms?.flatMap((r: Realm) => r.types || []) || [])).sort().map((type: unknown) => (
              <option key={type as string} value={type as string}>{type as string}</option>
            ))}
          </select>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {realms?.filter((r: Realm) => {
          if (selectedTier !== 'all' && r.tier !== selectedTier) return false;
          if (selectedType !== 'all' && !(r.types || []).includes(selectedType)) return false;
          return true;
        }).map((realm: Realm) => (
          <div
            key={realm.id}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${realm.isUnlocked
                ? `bg-gradient-to-br ${getTierColor(realm.tier)} hover:scale-[1.02] cursor-pointer hover:shadow-lg dark:hover:shadow-purple-900/20`
                : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-75 grayscale'
              }`}
            onClick={() => {
              if (realm.isUnlocked) {
                router.push(`/realms/${realm.id}`);
              } else {
                toast.error(`Requires ${realm.requiredRank.replace('_', ' ')} Rank`);
              }
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-xl font-bold ${realm.isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {realm.name}
                </h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${realm.isUnlocked ? 'bg-white/50 dark:bg-black/30 text-slate-900 dark:text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                  Tier {realm.tier}
                </span>
              </div>

              {!realm.isUnlocked ? (
                <div className="mt-4 flex items-center justify-center p-4 bg-slate-200/50 dark:bg-slate-900/50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Requires {realm.requiredRank.replace('_', ' ')} Rank
                  </span>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-bold">Wild Lv. {realm.minLevel} - {realm.maxLevel}</p>
                    <div className="flex flex-wrap gap-2">
                      {realm.types.map(t => (
                        <span key={t} className="text-xs px-2 py-1 bg-white/60 dark:bg-black/40 rounded-full border border-white/20 dark:border-black/20 font-bold capitalize">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Boss Sprite */}
                  <div className="relative w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/50 flex flex-col items-center justify-center p-1 shadow-sm shrink-0 ml-4 group-hover:scale-110 transition-transform">
                    <span className="absolute -top-2 bg-red-600 text-white text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded shadow-sm z-10">Alpha</span>
                    <img src={`http://localhost:3000/sprites/${realm.bossSpeciesId}.png`} alt={realm.bossSpeciesName} className="w-10 h-10 object-contain pixelated drop-shadow mb-0.5" />
                    <span className="text-[8px] font-bold text-red-900 dark:text-red-400 capitalize truncate w-full text-center">{realm.bossSpeciesName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}