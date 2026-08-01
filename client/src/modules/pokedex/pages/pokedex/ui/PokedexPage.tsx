import React, { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { api } from '@/shared/api/api';
import { Dropdown } from '@/shared/ui/Dropdown';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { CategorySelect } from '@/shared/ui/CategorySelect';
import { PokedexRow } from './PokedexRow';
import { SpeciesDto } from '@astranox/shared';
import { Loader2, Search } from 'lucide-react';

export const PokedexPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const limit = 50;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['pokedex', limit, selectedType, selectedCategory, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const typeParam = selectedType ? `&type=${selectedType}` : '';
      const catParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await api.get(`/pokedex/species?page=${pageParam}&limit=${limit}${typeParam}${catParam}${searchParam}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, limit, total } = lastPage.meta;
      if (page * limit < total) {
        return page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000 * 5, // 5 minutes
  });

  const allSpecies = data ? data.pages.flatMap(p => p.data) : [];
  const totalItems = data?.pages[0]?.meta?.total || 0;

  const pokemonTypes = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  const typeOptions = [
    { value: '', label: 'All Types', className: 'col-span-2 justify-center' },
    ...pokemonTypes.map(t => ({
      value: t.toLowerCase(),
      label: t,
      icon: <img src={getTypeSpriteUrl(t, true)} alt={t} className="h-5 w-auto object-contain drop-shadow-sm" />
    }))
  ];

  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? allSpecies.length + 1 : allSpecies.length,
    estimateSize: () => 104, // Approx row height with padding
    overscan: 5,
  });

  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;
    const lastItem = virtualItems[virtualItems.length - 1];

    if (
      lastItem.index >= allSpecies.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allSpecies.length,
    isFetchingNextPage,
    virtualizer.getVirtualItems(),
  ]);

  if (isLoading && allSpecies.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <span className="font-bold text-slate-500">Loading Pokédex...</span>
      </div>
    );
  }

  if (isError) {
    return <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-red-500 transition-colors duration-200">Failed to load Pokedex.</div>;
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        {/* Row 1: Pokedex and Total */}
        <div className="flex flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center whitespace-nowrap">
            National Pokédex
          </h1>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none flex items-center justify-center gap-2 h-10 whitespace-nowrap">
            Total: <span className="text-blue-600 dark:text-blue-400 font-black">{totalItems}</span>
          </div>
        </div>

        {/* Row 2: Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
          <div className="flex-1 w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Pokémon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <Search size={20} />
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col">
              <Dropdown
                value={selectedType}
                onChange={setSelectedType}
                options={typeOptions}
                placeholder="All Types"
                className="sm:w-48"
                dropdownClassName="w-full sm:w-64 max-h-80"
                optionsContainerClassName="grid grid-cols-2 gap-1 p-2"
              />
            </div>

            <div className="flex flex-col">
              <CategorySelect
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
          </div>
        </div>

        {allSpecies.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 font-bold">No Pokémon found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <div className="grid bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50 z-10 sticky top-0" style={{ gridTemplateColumns: '80px 1fr 240px 340px 120px' }}>
                  <div className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">#</div>
                  <div className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Pokémon</div>
                  <div className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Type</div>
                  <div className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Base Stats</div>
                  <div className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Total Stat</div>
                </div>

                <div ref={listRef} style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}>
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const isLoaderRow = virtualItem.index > allSpecies.length - 1;
                    const species = allSpecies[virtualItem.index];

                    return (
                      <div
                        key={virtualItem.key}
                        data-index={virtualItem.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        {isLoaderRow ? (
                          <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                          </div>
                        ) : (
                          <PokedexRow species={species} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
