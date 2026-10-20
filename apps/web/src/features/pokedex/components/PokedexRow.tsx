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
    <div className="flex flex-col lg:grid lg:items-center hover:bg-surface-raised/40 transition-colors duration-150 group border-b border-border/60 h-full lg:grid-cols-[80px_1fr_100px_240px_340px_120px] p-4 lg:p-0 gap-3 lg:gap-0">
      
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 lg:hidden w-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-surface-raised rounded-xl flex items-center justify-center p-1 border border-border shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img src={getSpriteUrl(species.id, species.spriteUrl)} alt={species.name} className="w-12 h-12 object-contain drop-shadow-sm" loading="lazy" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground capitalize text-base tracking-tight">
                {species.name.replace(/-/g, ' ')}
              </span>
              <span className="text-xs font-black text-muted">
                #{species.pokedexNumber || species.id}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-black text-foreground bg-surface-raised px-2.5 py-0.5 rounded-full border border-border shadow-xs leading-none">
              BST {bst}
            </span>
            <div className="flex gap-1 shrink-0">
              {species.type1 && <img src={getTypeSpriteUrl(species.type1.name, false)} alt={species.type1.name} className="h-4 w-auto shrink-0 object-contain drop-shadow-sm" loading="lazy" />}
              {species.type2 && <img src={getTypeSpriteUrl(species.type2.name, false)} alt={species.type2.name} className="h-4 w-auto shrink-0 object-contain drop-shadow-sm" loading="lazy" />}
            </div>
          </div>
        </div>
        
        {/* Badges */}
        {(species.category !== 'Normal' || species.isMega || species.isGmax || getBattleRank(species.id) !== 'Unranked') && (
          <div className="flex gap-1.5 flex-wrap">
            {getBattleRank(species.id) !== 'Unranked' && <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-xs tracking-wider">Rank {getBattleRank(species.id)}</span>}
            {species.category === 'Legendary' && <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Legendary</span>}
            {species.category === 'Mythical' && <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Mythical</span>}
            {species.category === 'Ultra Beast' && <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Ultra Beast</span>}
            {species.category === 'Paradox' && <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Paradox</span>}
            {species.category === 'Pseudo Legendary' && <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Pseudo</span>}
            {species.isMega && <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Mega</span>}
            {species.isGmax && <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">G-Max</span>}
          </div>
        )}

        {/* Base Stats */}
        <div className="grid grid-cols-6 gap-1 w-full bg-surface-raised/60 rounded-xl p-2 border border-border/60">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">HP</span>
            <span className="text-xs font-black text-foreground">{species.hp}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">Atk</span>
            <span className="text-xs font-black text-foreground">{species.attack}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">Def</span>
            <span className="text-xs font-black text-foreground">{species.defense}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">SpA</span>
            <span className="text-xs font-black text-foreground">{species.spAtk}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">SpD</span>
            <span className="text-xs font-black text-foreground">{species.spDef}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">Spe</span>
            <span className="text-xs font-black text-foreground">{species.speed}</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:contents">
        <div className="px-6 py-4 flex items-center">
          <span className="text-xs font-black text-muted">
            #{species.pokedexNumber || species.id}
          </span>
        </div>
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center p-1 border border-border shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
            <img
              src={getSpriteUrl(species.id, species.spriteUrl)}
              alt={species.name}
              className="w-10 h-10 object-contain drop-shadow-sm"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground capitalize text-base tracking-tight">
              {species.name.replace(/-/g, ' ')}
            </span>
            {(species.category !== 'Normal' || species.isMega || species.isGmax) && (
              <div className="mt-1 flex gap-1.5 flex-wrap">
                {species.category === 'Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Legendary</span>}
                {species.category === 'Mythical' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Mythical</span>}
                {species.category === 'Ultra Beast' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Ultra Beast</span>}
                {species.category === 'Paradox' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Paradox</span>}
                {species.category === 'Pseudo Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Pseudo</span>}
                {species.isMega && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">Mega</span>}
                {species.isGmax && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-surface-raised text-foreground border border-border shadow-xs">G-Max</span>}
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 flex items-center">
          <span className="text-xs font-bold text-muted bg-surface-raised border border-border px-2 py-0.5 rounded-md shadow-xs">
            {getBattleRank(species.id) !== 'Unranked' ? `Rank ${getBattleRank(species.id)}` : '-'}
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
              <span className="text-[9px] font-bold text-muted uppercase">HP</span>
              <span className="text-xs font-black text-foreground">{species.hp}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">Atk</span>
              <span className="text-xs font-black text-foreground">{species.attack}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">Def</span>
              <span className="text-xs font-black text-foreground">{species.defense}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">SpA</span>
              <span className="text-xs font-black text-foreground">{species.spAtk}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">SpD</span>
              <span className="text-xs font-black text-foreground">{species.spDef}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">Spe</span>
              <span className="text-xs font-black text-foreground">{species.speed}</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center">
          <span className="text-xs font-black text-foreground bg-surface-raised px-2.5 py-1 rounded-full border border-border shadow-xs">
            {bst}
          </span>
        </div>
      </div>
    </div>
  );
});
