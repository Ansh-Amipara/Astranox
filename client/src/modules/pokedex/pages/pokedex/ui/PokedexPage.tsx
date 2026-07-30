import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, getSpriteUrl } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { TypeSelect } from '@/components/ui/TypeSelect';
import { PokedexRow } from './PokedexRow';
import { CategorySelect } from '@/components/ui/CategorySelect';
import { Pagination } from '@/components/ui/Pagination';
import { SpeciesDto } from '@astranox/shared';

export const PokedexPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pokedex', page, limit, selectedType, selectedCategory],
    queryFn: async () => {
      const typeParam = selectedType ? `&type=${selectedType}` : '';
      const catParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const res = await api.get(`/pokedex?page=${page}&limit=${limit}${typeParam}${catParam}`);
      return res.data;
    },
    staleTime: 60 * 1000 * 5, // 5 minutes
  });

  const speciesList = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20 };
  const totalPages = Math.ceil(meta.total / limit);

  const pokemonTypes = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  if (isLoading) {
    return <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Pokedex...</div>;
  }

  if (isError) {
    return <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-red-500 transition-colors duration-200">Failed to load Pokedex.</div>;
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center whitespace-nowrap">
              National Pokédex
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Filters */}
            <div className="flex flex-row gap-4">
              <div className="flex flex-col">
                <TypeSelect
                  value={selectedType}
                  onChange={(type) => {
                    setSelectedType(type);
                    setPage(1);
                  }}
                  types={pokemonTypes}
                />
              </div>

              <div className="flex flex-col">
                <CategorySelect
                  value={selectedCategory}
                  onChange={(category) => {
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none flex items-center justify-center gap-2 h-10 whitespace-nowrap">
              Total: <span className="text-blue-600 dark:text-blue-400 font-black">{meta.total}</span>
            </div>
          </div>
        </div>

        {speciesList.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 font-bold">No Pokémon found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table role="table" className="w-full text-left border-collapse min-w-[1000px]">
                <thead role="rowgroup" className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50">
                  <tr role="row">
                    <th role="columnheader" className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-20">#</th>
                    <th role="columnheader" className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[300px]">Pokémon</th>
                    <th role="columnheader" className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[140px] whitespace-nowrap">Type</th>
                    <th role="columnheader" className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[300px] whitespace-nowrap">Base Stats</th>
                    <th role="columnheader" className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[120px] whitespace-nowrap">Total Stat</th>
                  </tr>
                </thead>
                <tbody role="rowgroup" className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {speciesList.map((species: SpeciesDto) => (
                    <PokedexRow key={species.id} species={species} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800"
        />
      </div>
    </div>
  );
};
