import React from 'react';
import { OwnedPokemonDto, MoveDto } from '@astranox/shared';
import { getSpriteUrl } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { getPotentialBadgeClasses, formatPotential } from '@/shared/utils/pokemonUtils';
import { getMaxLevelForPotential } from '@/shared/utils/pokemonUtils';

interface PokemonManagementCardProps {
  pokemon: OwnedPokemonDto;
  inParty: boolean;
  onClick: (pokemon: OwnedPokemonDto) => void;
}

export const PokemonManagementCard = React.memo(({ pokemon: p, inParty, onClick }: PokemonManagementCardProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(p);
        }
      }}
      className={`relative rounded-2xl overflow-hidden border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${inParty ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-900/80 shadow-lg hover:border-blue-500`}
      onClick={() => onClick(p)}
    >
      {inParty && !p.isEscrowed && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider z-10">
          In Party
        </div>
      )}
      {p.isEscrowed && (
        <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider z-10">
          In Trade
        </div>
      )}

      <div className="p-4 md:p-5 flex flex-col gap-4">
        {/* Top Section: Image and Core Info */}
        <div className="flex items-start gap-4 md:gap-5">
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner relative">
            <img
              src={p.species?.spriteUrl || (p as unknown as { spriteUrl?: string }).spriteUrl || getSpriteUrl(p.speciesId)}
              alt={(p as unknown as { name?: string }).name || p.speciesName}
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md pixelated hover:scale-110 transition-transform"
            />
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Header: Name and Bound Status */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white capitalize truncate flex items-center gap-1.5">
                <span className="truncate">{p.nickname || p.speciesName}</span>
                {p.isBound && (
                  <span className="inline-flex items-center shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wider" title="This Pokémon is bound to your account and cannot be traded or sold">
                    <span aria-hidden="true">🔒</span> Bound
                  </span>
                )}
              </h3>
            </div>

            {/* Type */}
            <div className="flex gap-1 mb-2.5">
              {p.species?.type1 && (
                <img src={getTypeSpriteUrl(p.species.type1.name, false)} alt={p.species.type1.name} title={p.species.type1.name} className="h-5 w-auto object-contain drop-shadow-sm" />
              )}
              {p.species?.type2 && (
                <img src={getTypeSpriteUrl(p.species.type2.name, false)} alt={p.species.type2.name} title={p.species.type2.name} className="h-5 w-auto object-contain drop-shadow-sm" />
              )}
            </div>

            {/* Potential and CP */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {p.potential && (
                <span className={`${getPotentialBadgeClasses(p.potential)} px-2 py-0.5 text-xs`}>
                  {formatPotential(p.potential)}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded font-black border border-indigo-200 dark:border-indigo-800/50 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                CP {p.cp?.toLocaleString() || 0}
              </span>
            </div>

            {/* Level and XP */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/50">
                <span className="text-[10px] font-bold uppercase mr-1 opacity-70">Lv.</span>
                <span className="text-sm font-black">{p.level}</span>
              </div>
              {p.potential && p.level >= getMaxLevelForPotential(p.potential as string) ? (
                <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Capped</span>
                </div>
              ) : (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase mr-1 opacity-70">XP</span>
                  <span className="text-xs font-bold">{(p.currentXp || 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Moves Section */}
        <div className="w-full pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map(i => {
            const move = p.equippedMoves?.find((m: { slot: number; move: MoveDto }) => m.slot === i)?.move;
            return (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded border border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-hidden h-8">
                {move ? (
                  <>
                    <img src={getTypeSpriteUrl(move.type, true)} alt={move.type} className="h-4 w-auto object-contain drop-shadow-sm shrink-0" />
                    <span className="font-bold text-slate-700 dark:text-slate-200 capitalize text-xs truncate w-full">{move.name.replace('-', ' ')}</span>
                  </>
                ) : (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600 opacity-50 shrink-0 mx-0.5"></div>
                    <span className="text-slate-400 dark:text-slate-500 italic text-[10px] uppercase tracking-wider">- Empty -</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
