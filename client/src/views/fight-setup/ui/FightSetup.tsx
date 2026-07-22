'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../../../shared/api/api';
import { useAuthStore } from '../../../shared/store/auth.store';


interface Species {
  id: number;
  name: string;
  spriteUrl: string;
}

export function FightSetup() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [speciesId, setSpeciesId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [level, setLevel] = useState<string>('5');
  const [error, setError] = useState('');
  const [lastBattle, setLastBattle] = useState<{speciesId: string, level: string} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lastCustomBattle');
    if (saved) {
      try {
        setLastBattle(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch species
  const { data: speciesData, isLoading: speciesLoading } = useQuery<{ success: boolean; data: Species[] }>({
    queryKey: ['availableSpecies'],
    queryFn: async () => {
      const { data } = await api.get('/battles/available-species');
      return data;
    },
    enabled: !!user,
  });

  const speciesList = speciesData?.data || [];

  const engageMutation = useMutation({
    mutationFn: (data: { speciesId: number; level: number }) => api.post('/battles/engage-custom', data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['activeBattle'] });
      const returnUrl = location.pathname + location.search;
      router.push(`/battle?returnUrl=${encodeURIComponent(returnUrl)}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to start battle');
    }
  });

  const handleBattle = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If they typed an exact name but didn't click it, try to resolve it
    let resolvedId = speciesId;
    if (!resolvedId && searchTerm) {
      const exactMatch = speciesList.find(s => s.name.toLowerCase() === searchTerm.toLowerCase());
      if (exactMatch) {
        resolvedId = exactMatch.id.toString();
        setSpeciesId(resolvedId);
      }
    }

    if (!resolvedId) {
      setError('Please select a valid Pokémon.');
      return;
    }

    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 2000) {
      setError('Please enter a valid level between 1 and 2000.');
      return;
    }

    const finalSpeciesId = resolvedId;
    const finalLevel = levelNum;

    localStorage.setItem('lastCustomBattle', JSON.stringify({ speciesId: finalSpeciesId, level: finalLevel.toString() }));

    engageMutation.mutate({
      speciesId: parseInt(finalSpeciesId, 10),
      level: finalLevel
    });
  };

  const handleBattleAgain = () => {
    if (!lastBattle) return;
    engageMutation.mutate({
      speciesId: parseInt(lastBattle.speciesId, 10),
      level: parseInt(lastBattle.level, 10)
    });
  };

  if (speciesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const selectedSpecies = speciesList.find(s => s.id === parseInt(speciesId, 10));
  const filteredSpecies = speciesList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6 flex flex-col items-center">
      <div className="w-full mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Custom Battle</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Select a Pokémon and level to fight against.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleBattle} className="space-y-6">
          <div className="relative" ref={dropdownRef}>
            <label htmlFor="speciesInput" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Search Pokémon
            </label>
            <input
              id="speciesInput"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSpeciesId(''); // Reset ID since user is typing a new search
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="e.g. Pikachu"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-slate-400"
              autoComplete="off"
            />
            
            {isDropdownOpen && (
              <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto ring-1 ring-black/5">
                {filteredSpecies.length === 0 ? (
                  <div className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm text-center">
                    No Pokémon found.
                  </div>
                ) : (
                  filteredSpecies.map(species => (
                    <button
                      key={species.id}
                      type="button"
                      onClick={() => {
                        setSpeciesId(species.id.toString());
                        setSearchTerm(species.name);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                    >
                      <span className="capitalize text-slate-800 dark:text-slate-200 font-medium">{species.name}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-sm font-mono">#{species.id}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Level (1-2000)
            </label>
            <input
              type="text"
              id="level"
              value={level}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val && parseInt(val, 10) > 2000) {
                  val = '2000';
                }
                setLevel(val);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-mono"
            />
          </div>

          {selectedSpecies && (
            <div className="flex justify-center my-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                <img
                  src={getSpriteUrl(selectedSpecies.id)}
                  alt={selectedSpecies.name}
                  className="w-32 h-32 object-contain relative z-10"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="submit"
              disabled={engageMutation.isPending || (!speciesId && !searchTerm) || !level}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
            >
              {engageMutation.isPending && (!lastBattle || speciesId !== lastBattle.speciesId) ? 'Starting...' : 'Battle!'}
            </button>
            
            {lastBattle && (
              <button
                type="button"
                onClick={handleBattleAgain}
                disabled={engageMutation.isPending}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg disabled:shadow-none flex flex-col items-center justify-center gap-1"
              >
                <span className="text-lg">Battle Again</span>
                <span className="text-xs font-normal opacity-90 text-center">
                  ({speciesList.find(s => s.id.toString() === lastBattle.speciesId)?.name || 'Unknown'} Lvl {lastBattle.level})
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
