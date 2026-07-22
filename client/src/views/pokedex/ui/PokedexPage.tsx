'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pokedexApi } from '../../../shared/api/api';
import { getTypeSpriteUrl } from '../../../shared/api/axios';
import { TypeSelect } from '../../../components/ui/TypeSelect';
import { Pagination } from '../../../components/ui/Pagination';

export function PokedexPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const limit = 24;

  const { data, isLoading } = useQuery({
    queryKey: ['pokedex', page, typeFilter, categoryFilter],
    queryFn: () => pokedexApi.getAllSpecies(page, limit, typeFilter, categoryFilter),
    staleTime: 60000,
  });



  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const TYPES = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 mb-4">
            Pokédex
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
            The complete database of all known Pokémon species in the Astranox universe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
            <TypeSelect
              value={typeFilter}
              onChange={(type) => {
                setTypeFilter(type);
                setPage(1);
              }}
              types={TYPES}
            />

            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-48 font-semibold"
            >
              <option value="">All Categories</option>
              <option value="regular">Regular</option>
              <option value="mega">Mega Evolution</option>
              <option value="gmax">Gigantamax</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-bold">Loading Pokédex data...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data?.data?.map((species: any) => (
                <div
                  key={species.id}
                  className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group"
                >
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 self-start mb-2">
                    #{String(species.id).padStart(4, '0')}
                  </span>
                  
                  <div className="w-24 h-24 mb-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-full group-hover:scale-110 transition-transform">
                    <img 
                      src={species.spriteUrl} 
                      alt={species.name} 
                      className="w-16 h-16 object-contain pixelated drop-shadow-md"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize mb-3 text-center truncate w-full">
                    {species.name}
                  </h3>

                  <div className="flex gap-1 justify-center w-full">
                    {species.type1 && (
                      <img src={getTypeSpriteUrl(species.type1.name)} alt={species.type1.name} title={species.type1.name} className="h-4 object-contain drop-shadow-sm" />
                    )}
                    {species.type2 && (
                      <img src={getTypeSpriteUrl(species.type2.name)} alt={species.type2.name} title={species.type2.name} className="h-4 object-contain drop-shadow-sm" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {data?.meta && (
              <div className="mt-12 mb-8">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(data.meta.total / limit)}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
