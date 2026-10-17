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
    <div className="flex flex-col lg:grid lg:items-center hover:bg-surface-raised/50 transition-colors group border-b border-border/60 h-full lg:grid-cols-[80px_1fr_100px_240px_340px_120px] p-4 lg:p-0 gap-3 lg:gap-0">
      
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 lg:hidden w-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-surface-raised rounded-xl flex items-center justify-center p-1 border border-border shrink-0">
              <img src={getSpriteUrl(species.id, species.spriteUrl)} alt={species.name} className="w-12 h-12 object-contain drop-shadow-sm" loading="lazy" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground capitalize text-lg">
                {species.name.replace('-', ' ')}
              </span>
              <span className="text-sm font-black text-muted">
                #{species.pokedexNumber || species.id}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-black text-foreground bg-surface-raised px-2 py-1 rounded border border-border/50 leading-none">
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
            {getBattleRank(species.id) !== 'Unranked' && <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-surface-raised text-foreground border border-border shadow-sm tracking-wide">Rank {getBattleRank(species.id)}</span>}
            {species.category === 'Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Legendary</span>}
            {species.category === 'Mythical' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Mythical</span>}
            {species.category === 'Ultra Beast' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Ultra Beast</span>}
            {species.category === 'Paradox' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Paradox</span>}
            {species.category === 'Pseudo Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Pseudo</span>}
            {species.isMega && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Mega</span>}
            {species.isGmax && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">G-Max</span>}
          </div>
        )}

        {/* Base Stats */}
        <div className="grid grid-cols-6 gap-1 w-full bg-surface-raised rounded-lg p-2 border border-border">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">HP</span>
            <span className="text-xs font-black text-muted">{species.hp}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">Atk</span>
            <span className="text-xs font-black text-muted">{species.attack}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">Def</span>
            <span className="text-xs font-black text-muted">{species.defense}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">SpA</span>
            <span className="text-xs font-black text-muted">{species.spAtk}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">SpD</span>
            <span className="text-xs font-black text-muted">{species.spDef}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted uppercase">Spe</span>
            <span className="text-xs font-black text-muted">{species.speed}</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:contents">
        <div className="px-6 py-4 flex items-center">
          <span className="text-sm font-black text-muted">
            #{species.pokedexNumber || species.id}
          </span>
        </div>
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center p-1 border border-border shrink-0">
            <img
              src={getSpriteUrl(species.id, species.spriteUrl)}
              alt={species.name}
              className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground capitalize text-lg">
              {species.name.replace('-', ' ')}
            </span>
            {(species.category !== 'Normal' || species.isMega || species.isGmax) && (
              <div className="mt-1 flex gap-1.5 flex-wrap">
                {species.category === 'Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Legendary</span>}
                {species.category === 'Mythical' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Mythical</span>}
                {species.category === 'Ultra Beast' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Ultra Beast</span>}
                {species.category === 'Paradox' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Paradox</span>}
                {species.category === 'Pseudo Legendary' && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Pseudo</span>}
                {species.isMega && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">Mega</span>}
                {species.isGmax && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-surface-raised text-foreground border border-border/50">G-Max</span>}
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 flex items-center">
          <span className="text-sm font-bold text-muted">
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
              <span className="text-[9px] font-bold text-muted uppercase">HP</span>
              <span className="text-xs font-black text-muted">{species.hp}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">Atk</span>
              <span className="text-xs font-black text-muted">{species.attack}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">Def</span>
              <span className="text-xs font-black text-muted">{species.defense}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">SpA</span>
              <span className="text-xs font-black text-muted">{species.spAtk}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">SpD</span>
              <span className="text-xs font-black text-muted">{species.spDef}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted uppercase">Spe</span>
              <span className="text-xs font-black text-muted">{species.speed}</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center">
          <span className="text-sm font-black text-foreground bg-surface-raised px-2 py-1 rounded border border-border/50">
            {bst}
          </span>
        </div>
      </div>
    </div>
  );
});
