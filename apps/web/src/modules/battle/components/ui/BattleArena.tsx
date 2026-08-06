import { memo } from 'react';
import { PokemonSprite } from '@/entities/pokemon/ui/PokemonSprite';
import { HealthBar } from '@/shared/ui/HealthBar';
import { StatusIcons } from '@/shared/ui/StatusIcons';
import { WeatherEffects } from './WeatherEffects';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { ActivePokemonDto, OwnedPokemonDto } from '@astranox/shared';
import { formatPotential } from '@/shared/utils/pokemonUtils';
import { getMaxLevelForPotential } from '@/shared/utils/pokemonUtils';
interface Props {
  wild: ActivePokemonDto & { name?: string; isCorrupted?: boolean; statusAilment?: string };
  player: ActivePokemonDto & { name?: string; nickname?: string; statusAilment?: string };
  opponentPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
  playerPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
}

export const BattleArena = memo(function BattleArena({ wild, player, opponentPartyData, playerPartyData }: Props) {
  return (
    <div
      className="relative z-10 w-full h-full flex-1 p-2 sm:p-4 bg-white dark:bg-slate-900 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.1)] transition-colors"
    >
      <WeatherEffects weather={null} />

      {/* Wild Info Card (Top Left) */}
      <div className="absolute top-2 left-2 sm:top-6 sm:left-6 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-2xl p-2 sm:p-4 shadow-2xl w-[calc(100%-1rem)] max-w-[280px] sm:w-80 md:w-96 z-20 text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-start mb-1 sm:mb-2 gap-2">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-2xl font-bold capitalize tracking-wide drop-shadow-sm line-clamp-1 sm:line-clamp-2 break-words">{wild.name || wild.speciesName}</h2>
              {wild.isCorrupted && (
                <span className="px-1.5 py-0.5 bg-purple-900/80 text-purple-200 border border-purple-500/50 rounded-sm text-[10px] font-black uppercase tracking-widest">
                  Corrupted
                </span>
              )}
            </div>
            {wild.types && (
              <div className="flex gap-1 mt-0.5">
                {wild.types.map((t: string) => (
                  <img key={t} src={getTypeSpriteUrl(t)} alt={t} title={t} className="h-4 sm:h-5 object-contain drop-shadow" />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 drop-shadow-sm">Lv {wild.level}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1 sm:mb-1.5 mt-1.5 sm:mt-2">
          {/* Opponent Party Dots */}
          {opponentPartyData && opponentPartyData.length > 0 ? (
            <div className="flex gap-1 sm:gap-1.5 shrink-0">
              {opponentPartyData.map((p: OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string }, idx: number) => (
                <div
                  key={p.id || idx}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-400 dark:border-slate-600 ${p.currentHp > 0 ? 'bg-red-500 shadow-sm' : 'bg-slate-400 dark:bg-slate-700 opacity-40'}`}
                  title={`${p.name || p.species?.name || 'Pokemon'} (${p.currentHp > 0 ? 'Healthy' : 'Fainted'})`}
                ></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-1 sm:gap-1.5 shrink-0">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-400 dark:border-slate-600 ${wild.currentHp > 0 ? 'bg-red-500 shadow-sm' : 'bg-slate-400 dark:bg-slate-700 opacity-40'}`}></div>
            </div>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold shrink-0">
            {wild.currentHp} / {wild.maxHp}
          </div>
        </div>

        <div className="w-full">
          <HealthBar currentHp={wild.currentHp} maxHp={wild.maxHp} hideText={true} />
        </div>
        <StatusIcons statusAilment={wild.statusAilment} />
      </div>

      {/* Wild Sprite (Top Right) */}
      <div className="absolute top-16 right-4 sm:top-12 sm:right-16 z-10 pointer-events-none">
        <PokemonSprite
          speciesId={wild.speciesId}
          speciesName={wild.name || wild.speciesName}
          isPlayer={false}
          className=""
        />
      </div>

      {/* Player Sprite (Bottom Left) */}
      <div className="absolute bottom-28 left-4 sm:bottom-12 sm:left-24 z-10 pointer-events-none">
        <PokemonSprite
          speciesId={player.speciesId}
          speciesName={player.name || player.speciesName}
          isPlayer={true}
          className=""
        />
      </div>

      {/* Player Info Card (Bottom Right) */}
      <div className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-2xl p-2 sm:p-4 shadow-2xl w-[calc(100%-1rem)] max-w-[280px] sm:w-80 md:w-96 z-20 text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-start mb-1 sm:mb-2 gap-2">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <h3 className="text-sm sm:text-xl font-bold capitalize tracking-wide drop-shadow-sm line-clamp-1 sm:line-clamp-2 break-words">
              {player.name || player.nickname || player.speciesName}
            </h3>
            {player.types && (
              <div className="flex gap-1 mt-0.5">
                {player.types.map((t: string) => (
                  <img key={t} src={getTypeSpriteUrl(t)} alt={t} title={t} className="h-4 sm:h-5 object-contain drop-shadow" />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0">
            {player.potential && (
              <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-400 dark:border-slate-600 rounded font-bold uppercase tracking-wider mb-0.5">
                {formatPotential(player.potential)}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 drop-shadow-sm">Lv {player.level}</span>
              {player.potential && player.level >= getMaxLevelForPotential(player.potential as string) && (
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-100 bg-slate-900/50 border border-slate-700/50 px-1 rounded uppercase">Capped</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1 sm:mb-1.5 mt-1.5 sm:mt-2">
          {/* Player Party Dots */}
          {playerPartyData && playerPartyData.length > 0 ? (
            <div className="flex gap-1 sm:gap-1.5 shrink-0">
              {playerPartyData.map((p: OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string }, idx: number) => (
                <div
                  key={p.id || idx}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-400 dark:border-slate-600 ${p.currentHp > 0 ? 'bg-green-500 shadow-sm' : 'bg-slate-400 dark:bg-slate-700 opacity-40'}`}
                  title={`${p.name || p.species?.name} (${p.currentHp > 0 ? 'Healthy' : 'Fainted'})`}
                ></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-1 sm:gap-1.5 shrink-0">
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-400 dark:border-slate-600 ${player.currentHp > 0 ? 'bg-green-500 shadow-sm' : 'bg-slate-400 dark:bg-slate-700 opacity-40'}`}></div>
            </div>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold shrink-0">
            {player.currentHp} / {player.maxHp}
          </div>
        </div>

        <div className="w-full">
          <HealthBar currentHp={player.currentHp} maxHp={player.maxHp} hideText={true} />
        </div>
        <StatusIcons statusAilment={player.statusAilment} />
      </div>
    </div>
  );
});

