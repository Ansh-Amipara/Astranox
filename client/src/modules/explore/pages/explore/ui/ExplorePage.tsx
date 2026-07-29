import React from 'react';
import { Link } from 'react-router-dom';

export const LOCATIONS = [
  'PLAINS', 'FOREST', 'VOLCANO', 'OCEAN', 'FROZEN_PEAKS',
  'DESERT', 'MOUNTAIN', 'HAUNTED_RUINS', 'FAIRY_GARDEN',
  'SWAMP', 'ANCIENT_TEMPLE', 'CRYSTAL_CAVE', 'SKY_ISLANDS',
  'ALOLA_REGION', 'HISUI_REGION', 'GALAR_REGION', 'PALDEA_REGION'
];

export function getRealmImagePath(locationId: string): string {
  let name = locationId.toLowerCase().replace(/_/g, ' ');
  if (name.endsWith(' region')) {
    name = name.replace(' region', '');
  }
  return `/realm/${name}.png`;
}

export function ExplorePage() {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
            Explore
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {LOCATIONS.map(loc => (
            <Link key={loc} to={`/explore/${loc}`} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center hover:border-ink-blue/50 hover:shadow-ink-blue/10 transition-all group">
              <div className="w-full h-32 mb-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <img src={getRealmImagePath(loc)} alt={loc} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-4 capitalize group-hover:text-ink-blue dark:group-hover:text-ink-light transition-colors">
                {loc.replace(/_/g, ' ').toLowerCase()}
              </h3>

              <div className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl group-hover:bg-ink-blue group-hover:text-white dark:group-hover:bg-ink-blue dark:group-hover:text-white transition-colors flex items-center justify-center gap-2">
                Enter Region
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
