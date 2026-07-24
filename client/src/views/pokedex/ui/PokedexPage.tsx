import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../../../shared/api/api';
import { getTypeSpriteUrl } from '../../../shared/api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TypeSelect } from '../../../components/ui/TypeSelect';

export const PokedexPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const limit = 24;

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
  const meta = data?.meta || { total: 0, page: 1, limit: 24 };
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-xl text-lg font-black tracking-widest shadow-lg shadow-blue-600/30">DEX</span>
              National Pokédex
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Discover and learn about every known Pokémon species.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none flex items-center gap-2">
            Total Discovered: <span className="text-blue-600 dark:text-blue-400 font-black">{meta.total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1">Filter by Type</label>
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
            <label className="text-xs font-bold text-slate-500 uppercase mb-1">Filter by Form</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="all">All Forms</option>
              <option value="regular">Regular Only</option>
              <option value="mega">Mega Evolutions</option>
              <option value="gmax">Gigantamax (G-Max)</option>
            </select>
          </div>
        </div>

        {speciesList.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 font-bold">No Pokémon found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speciesList.map((species: any) => {
              const bst = species.hp + species.attack + species.defense + species.spAtk + species.spDef + species.speed;
              
              return (
                <div
                  key={species.id}
                  className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="p-6 flex items-start gap-5">
                    <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={getSpriteUrl(species.id)}
                        alt={species.name}
                        className="w-20 h-20 object-contain drop-shadow-md z-10 transition-transform group-hover:scale-110"
                      />
                      <span className="absolute bottom-1 right-1.5 text-[9px] font-black text-slate-300 dark:text-slate-600 opacity-50 z-0">
                        #{species.pokedexNumber || species.id}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize truncate mb-2">
                        {species.name.replace('-', ' ')}
                      </h3>
                      
                      <div className="flex gap-1.5 flex-wrap">
                        {species.type1 && (
                          <img src={getTypeSpriteUrl(species.type1.name, false)} alt={species.type1.name} title={species.type1.name} className="h-5 w-auto object-contain drop-shadow-sm" />
                        )}
                        {species.type2 && (
                          <img src={getTypeSpriteUrl(species.type2.name, false)} alt={species.type2.name} title={species.type2.name} className="h-5 w-auto object-contain drop-shadow-sm" />
                        )}
                      </div>
                      
                      {(species.isLegendary || species.isMythical || species.isMega) && (
                        <div className="mt-2 flex gap-1.5">
                          {species.isLegendary && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50">Legendary</span>}
                          {species.isMythical && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-700/50">Mythical</span>}
                          {species.isMega && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700/50">Mega</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Stats</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/50">BST: {bst}</span>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-1">
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
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Prev
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Page <span className="text-slate-900 dark:text-white font-black">{page}</span> of {totalPages}
              </span>
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
