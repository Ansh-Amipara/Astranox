import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, getSpriteUrl } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { TypeSelect } from '@/components/ui/TypeSelect';
import { CategorySelect } from '@/components/ui/CategorySelect';
import { Pagination } from '@/components/ui/Pagination';

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
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-20">#</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[300px]">Pokémon</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[140px] whitespace-nowrap">Type</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[300px] whitespace-nowrap">Base Stats</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[120px] whitespace-nowrap">Total Stat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {speciesList.map((species: any) => {
                    const bst = species.hp + species.attack + species.defense + species.spAtk + species.spDef + species.speed;

                    return (
                      <tr key={species.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-400 dark:text-slate-500">
                            #{species.pokedexNumber || species.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700">
                              <img
                                src={getSpriteUrl(species.id)}
                                alt={species.name}
                                className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white capitalize text-lg">
                                {species.name.replace('-', ' ')}
                              </span>
                              {(species.category !== 'Normal' || species.isMega || species.isGmax) && (
                                <div className="mt-1 flex gap-1.5 flex-wrap">
                                  {species.category === 'Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50">Legendary</span>}
                                  {species.category === 'Mythical' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-700/50">Mythical</span>}
                                  {species.category === 'Ultra Beast' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/50">Ultra Beast</span>}
                                  {species.category === 'Paradox' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-700/50">Paradox</span>}
                                  {species.category === 'Pseudo Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50">Pseudo</span>}
                                  {species.isMega && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700/50">Mega</span>}
                                  {species.isGmax && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700/50">G-Max</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5 flex-nowrap">
                            {species.type1 && (
                              <img src={getTypeSpriteUrl(species.type1.name, false)} alt={species.type1.name} title={species.type1.name} className="h-5 w-auto object-contain drop-shadow-sm" />
                            )}
                            {species.type2 && (
                              <img src={getTypeSpriteUrl(species.type2.name, false)} alt={species.type2.name} title={species.type2.name} className="h-5 w-auto object-contain drop-shadow-sm" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">HP</span>
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300">{species.hp}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Atk</span>
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300">{species.attack}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Def</span>
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300">{species.defense}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">SpA</span>
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300">{species.spAtk}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">SpD</span>
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300">{species.spDef}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Spe</span>
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300">{species.speed}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800/50">
                            {bst}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
