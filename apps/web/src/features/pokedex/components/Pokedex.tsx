import React, { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { api } from '@/shared/api/api';
import { Dropdown } from '@/shared/ui/Dropdown';
import { getTypeSpriteUrl } from '@/lib/axios';
import { PokedexRow } from './PokedexRow';
import { SpeciesDto } from '@astranox/types';;
import { Loader2 } from 'lucide-react';

export const PokedexPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const limit = 50;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['pokedex', limit, selectedType, selectedRank, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const typeParam = selectedType ? `&type=${selectedType}` : '';
      const rankParam = selectedRank !== 'all' ? `&rank=${selectedRank}` : '';
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await api.get(`/pokedex/species?page=${pageParam}&limit=${limit}${typeParam}${rankParam}${searchParam}`);
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
    estimateSize: () => typeof window !== 'undefined' && window.innerWidth < 1024 ? 200 : 104,
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
      <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center text-foreground transition-colors duration-200">
        <Loader2 className="w-8 h-8 animate-spin text-foreground mb-4" />
        <span className="font-bold text-muted">Loading Pokédex...</span>
      </div>
    );
  }

  if (isError) {
    return <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center text-muted transition-colors duration-200">Failed to load Pokedex.</div>;
  }

  return (
    <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        {/* Row 1: Pokedex and Total */}
        <div className="flex flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground flex items-center whitespace-nowrap">
            National Pokédex
          </h1>
          <div className="bg-surface border border-border px-4 py-2 rounded-lg font-bold text-foreground shadow-sm flex items-center justify-center gap-2 h-10 whitespace-nowrap">
            Total: <span className="text-foreground font-black">{totalItems}</span>
          </div>
        </div>

        {/* Row 2: Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 border-b border-border pb-4 gap-4">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Dropdown
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              placeholder="All Types"
              className="w-full"
              dropdownClassName="w-full sm:w-64 max-h-80"
              optionsContainerClassName="grid grid-cols-2 gap-1 p-2"
            />

            <Dropdown
              value={selectedRank}
              onChange={setSelectedRank}
              options={[
                { value: 'all', label: 'All Ranks' },
                { value: 'EX', label: 'Rank EX' },
                { value: 'SSS', label: 'Rank SSS' },
                { value: 'SS', label: 'Rank SS' },
                { value: 'S', label: 'Rank S' },
                { value: 'A', label: 'Rank A' },
                { value: 'B', label: 'Rank B' },
                { value: 'C', label: 'Rank C' },
              ]}
              placeholder="All Ranks"
              className="w-full"
              dropdownClassName="w-full max-h-80"
            />
          </div>
        </div>

        {allSpecies.length === 0 ? (
          <div className="text-center p-12 bg-background rounded-3xl border border-border">
            <p className="text-subtle font-bold">No Pokémon found.</p>
          </div>
        ) : (
          <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="w-full lg:overflow-x-auto custom-scrollbar">
              <div className="w-full lg:min-w-[900px]">
                <div className="hidden lg:grid bg-surface border-b border-border z-10 sticky top-0 grid-cols-[80px_1fr_100px_240px_340px_120px]">
                  <div className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">#</div>
                  <div className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Pokémon</div>
                  <div className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Rank</div>
                  <div className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Type</div>
                  <div className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Base Stats</div>
                  <div className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Total</div>
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
                            <Loader2 className="w-6 h-6 animate-spin text-muted" />
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
