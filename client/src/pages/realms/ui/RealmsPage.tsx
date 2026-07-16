import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { realmsApi } from '../../../shared/api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface Realm {
  id: string;
  name: string;
  tier: number;
  unlockRank: string;
  isUnlocked: boolean;
  pokemon: string[];
  types?: string[];
}

export function RealmsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: realms, isLoading } = useQuery({
    queryKey: ['realms'],
    queryFn: realmsApi.getRealms,
  });

  const exploreMutation = useMutation({
    mutationFn: realmsApi.exploreRealm,
    onSuccess: (data) => {
      if (data.event === 'battle') {
        toast.success(`A wild Pokémon appeared!`);
        const returnUrl = location.pathname + location.search;
        navigate('/battle', { state: { returnUrl } });
      } else if (data.event === 'item') {
        toast.success(`You found a ${data.item.name}!`);
        setSelectedRealm(null);
      } else if (data.event === 'money') {
        toast.success(`You found ${data.amount} ₽!`);
        setSelectedRealm(null);
      } else {
        toast.info(`You explored the realm but found nothing...`);
        setSelectedRealm(null);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to explore realm.');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Connecting to the Astral Realms...</div>;
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'from-stone-300/20 to-orange-600/20 border-orange-500/50'; // Bronze
      case 2: return 'from-slate-300/20 to-slate-500/20 border-slate-400/50'; // Silver
      case 3: return 'from-yellow-400/20 to-yellow-600/20 border-yellow-500/50'; // Gold
      case 4: return 'from-cyan-400/20 to-blue-600/20 border-cyan-500/50'; // Platinum
      case 5: return 'from-purple-400/20 to-indigo-600/20 border-purple-500/50'; // Diamond
      case 6: return 'from-rose-400/20 to-red-600/20 border-rose-500/50'; // Epic
      case 7: return 'from-amber-300/30 via-orange-500/30 to-red-600/30 border-amber-400'; // Legendary
      default: return 'from-slate-400/20 to-slate-600/20 border-slate-500/50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
          {[1, 2, 3, 4, 5, 6, 7].map(tier => (
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
                setSelectedRealm(realm);
              } else {
                toast.error(`Requires ${realm.unlockRank.replace('_', ' ')} Rank`);
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
                    Requires {realm.unlockRank.replace('_', ' ')} Rank
                  </span>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-medium">Known Inhabitants:</p>
                  <div className="flex flex-wrap gap-2">
                    {realm.pokemon.slice(0, 4).map(p => (
                      <span key={p} className="text-xs px-2 py-1 bg-white/40 dark:bg-black/40 rounded border border-white/20 dark:border-black/20 capitalize">
                        {p}
                      </span>
                    ))}
                    {realm.pokemon.length > 4 && (
                      <span className="text-xs px-2 py-1 bg-white/20 dark:bg-black/20 rounded">
                        +{realm.pokemon.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRealm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Enter {selectedRealm.name}?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You are about to explore this realm. You may encounter wild Pokémon, find rare items, or uncover hidden wealth. Are you prepared?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setSelectedRealm(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                disabled={exploreMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => exploreMutation.mutate(selectedRealm.id)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2"
                disabled={exploreMutation.isPending}
              >
                {exploreMutation.isPending ? 'Exploring...' : 'Explore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
