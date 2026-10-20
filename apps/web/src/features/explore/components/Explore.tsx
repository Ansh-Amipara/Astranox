import React from 'react';
import { Link } from 'react-router-dom';
import { getTypeSpriteUrl } from '@/lib/axios';
import { Compass, MapPin } from 'lucide-react';

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
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-4rem)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* Hero Banner Section */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden border border-border shadow-sm bg-surface">
          <img
            src="/banners/realm-hero.webp"
            alt="Astranox Overworld Realm & Wilderness"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
          {/* Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/25">
                    Wilderness Realm
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white/70">
                    18 Elemental Habitats
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  Exploration Realms
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-lg line-clamp-1 sm:line-clamp-none">
                  Venture into elemental zones to encounter wild species, gather resources, and expand your Pokédex.
                </p>
              </div>

              {/* Exploration Stats Chip */}
              <div className="flex items-center gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                  <Compass className="w-4 h-4 text-white/80" />
                  <span className="text-xs sm:text-sm font-black text-white">Open World Grid</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {LOCATIONS.map(loc => {
            const typeName = loc.replace('_REGION', '').toLowerCase();
            return (
              <Link
                key={loc}
                to={`/explore/${loc}`}
                className="group bg-surface rounded-3xl shadow-xs border border-border p-5 flex flex-col items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 select-none touch-manipulation relative overflow-hidden"
              >
                <div className="w-full h-24 mb-4 rounded-2xl bg-surface-raised flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform duration-200">
                  <img src={getTypeSpriteUrl(typeName, true)} alt={loc} className="h-8 w-auto object-contain drop-shadow-xs" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground text-center mb-3 capitalize">
                  {typeName} Realm
                </h3>

                <div className="w-full min-h-[44px] py-2.5 bg-surface-raised group-hover:bg-primary text-foreground group-hover:text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-border flex items-center justify-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Enter Realm
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
