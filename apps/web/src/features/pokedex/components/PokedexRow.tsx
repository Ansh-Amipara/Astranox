import React from 'react';
import { getSpriteUrl } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { SpeciesDto } from '@astranox/types';;
import { getBattleRank } from '@/features/social/battleRanksMap';

interface PokedexRowProps {
  species: SpeciesDto;
}

export const PokedexRow = React.memo(({ species }: PokedexRowProps) => {
  const bst = species.hp + species.attack + species.defense + species.spAtk + species.spDef + species.speed;

  return (
    <div className="flex flex-col lg:grid lg:items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group border-b border-slate-100 dark:border-slate-800/60 h-full lg:grid-cols-[80px_1fr_100px_240px_340px_120px] p-4 lg:p-0 gap-3 lg:gap-0">
      
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 lg:hidden w-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700 shrink-0">
              <img src={getSpriteUrl(species.id, species.spriteUrl)} alt={species.name} className="w-12 h-12 object-contain drop-shadow-sm" loading="lazy" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white capitalize text-lg">
                {species.name.replace('-', ' ')}
              </span>
              <span className="text-sm font-black text-slate-400 dark:text-slate-500">
                #{species.pokedexNumber || species.id}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800/50 leading-none">
              BST: {bst}
            </span>
            <div className="flex gap-1 shrink-0">
              {species.type1 && <img src={getTypeSpriteUrl(species.type1.name, false)} className="h-4 w-auto shrink-0 object-contain" loading="lazy" />}
              {species.type2 && <img src={getTypeSpriteUrl(species.type2.name, false)} className="h-4 w-auto shrink-0 object-contain" loading="lazy" />}
            </div>
          </div>
        </div>
        
        {/* Badges */}
        {(species.category !== 'Normal' || species.isMega || species.isGmax || getBattleRank(species.id) !== 'Unranked') && (
          <div className="flex gap-1.5 flex-wrap">
            {getBattleRank(species.id) !== 'Unranked' && <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-700 dark:border-white shadow-sm tracking-wide">Rank {getBattleRank(species.id)}</span>}
            {species.category === 'Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50">Legendary</span>}
            {species.category === 'Mythical' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-700/50">Mythical</span>}
            {species.category === 'Ultra Beast' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/50">Ultra Beast</span>}
            {species.category === 'Paradox' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-700/50">Paradox</span>}
            {species.category === 'Pseudo Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50">Pseudo</span>}
            {species.isMega && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700/50">Mega</span>}
            {species.isGmax && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700/50">G-Max</span>}
          </div>
        )}

        {/* Base Stats */}
        <div className="grid grid-cols-6 gap-1 w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
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

      {/* Desktop Layout */}
      <div className="hidden lg:contents">
        <div className="px-6 py-4 flex items-center">
          <span className="text-sm font-black text-slate-400 dark:text-slate-500">
            #{species.pokedexNumber || species.id}
          </span>
        </div>
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700 shrink-0">
            <img
              src={getSpriteUrl(species.id, species.spriteUrl)}
              alt={species.name}
              className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
              loading="lazy"
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
        <div className="px-6 py-4 flex items-center">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {getBattleRank(species.id) !== 'Unranked' ? getBattleRank(species.id) : '-'}
          </span>
        </div>
        <div className="px-6 py-4 flex items-center overflow-hidden">
          <div className="flex gap-1.5 flex-nowrap">
            {species.type1 && (
              <img src={getTypeSpriteUrl(species.type1.name, false)} alt={species.type1.name} title={species.type1.name} className="h-5 w-auto shrink-0 object-contain drop-shadow-sm" loading="lazy" />
            )}
            {species.type2 && (
              <img src={getTypeSpriteUrl(species.type2.name, false)} alt={species.type2.name} title={species.type2.name} className="h-5 w-auto shrink-0 object-contain drop-shadow-sm" loading="lazy" />
            )}
          </div>
        </div>
        <div className="px-6 py-4 flex items-center overflow-hidden">
          <div className="flex gap-2 lg:gap-3 flex-nowrap w-full">
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
        <div className="px-6 py-4 flex items-center">
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800/50">
            {bst}
          </span>
        </div>
      </div>
    </div>
  );
});
