import React from 'react';
import { Link } from 'react-router-dom';

import { getTypeSpriteUrl } from '@/shared/api/axios';

export const LOCATIONS = [
  'NORMAL_REGION',
  'FIRE_REGION',
  'WATER_REGION',
  'GRASS_REGION',
  'ELECTRIC_REGION',
  'ICE_REGION',
  'FIGHTING_REGION',
  'POISON_REGION',
  'GROUND_REGION',
  'FLYING_REGION',
  'PSYCHIC_REGION',
  'BUG_REGION',
  'ROCK_REGION',
  'GHOST_REGION',
  'DRAGON_REGION',
  'DARK_REGION',
  'STEEL_REGION',
  'FAIRY_REGION'
];

export function ExplorePage() {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
            Explore
          </h1>
          <p className="text-slate-500">Select a region to encounter wild Pokémon.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {LOCATIONS.map(loc => {
            const typeName = loc.replace('_REGION', '').toLowerCase();
            return (
              <Link key={loc} to={`/explore/${loc}`} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center hover:border-ink-blue/50 hover:shadow-ink-blue/10 transition-all group">
                <div className="w-full h-24 mb-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  <img src={getTypeSpriteUrl(typeName, true)} alt={loc} className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-4 capitalize group-hover:text-ink-blue dark:group-hover:text-ink-light transition-colors">
                  {typeName} Region
                </h3>

                <div className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl group-hover:bg-ink-blue group-hover:text-white dark:group-hover:bg-ink-blue dark:group-hover:text-white transition-colors flex items-center justify-center gap-2">
                  Enter Region
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
