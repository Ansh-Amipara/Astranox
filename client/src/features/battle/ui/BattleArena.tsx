import { memo } from 'react';
import { PokemonSprite } from '../../../entities/pokemon/ui/PokemonSprite';
import { HealthBar } from '../../../shared/ui/HealthBar';
import { StatusIcons } from '../../../shared/ui/StatusIcons';
import { WeatherEffects } from './WeatherEffects';
import { getTypeSpriteUrl } from '../../../shared/api/axios';

interface Props {
  wild: any;
  player: any;
  opponentPartyData: any[];
  playerPartyData: any[];
}

export const BattleArena = memo(function BattleArena({ wild, player, opponentPartyData, playerPartyData }: Props) {
  return (
    <div 
      className="relative z-10 flex-1 flex flex-col justify-between p-4 bg-white dark:bg-slate-900 min-h-0 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.1)] transition-colors"
    >
      <WeatherEffects weather={null} />

      {/* Wild Info Card (Top Left) */}
      <div className="absolute top-6 left-6 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-2xl w-96 z-20 text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-end mb-2 gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold capitalize tracking-wide drop-shadow-sm line-clamp-2 break-words">{wild.name || wild.speciesName}</h2>
              {wild.isCorrupted && (
                <span className="px-1.5 py-0.5 bg-purple-900/80 text-purple-200 border border-purple-500/50 rounded-sm text-[10px] font-black uppercase tracking-widest">
                  Corrupted
                </span>
              )}
            </div>
            {wild.types && (
              <div className="flex gap-1 mt-1">
                {wild.types.map((t: string) => (
                  <img key={t} src={getTypeSpriteUrl(t)} alt={t} title={t} className="h-5 object-contain drop-shadow" />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 drop-shadow-sm">Lv {wild.level}</span>
            </div>
          </div>
        </div>



        {/* Opponent Party Dots */}
        {opponentPartyData && opponentPartyData.length > 0 ? (
          <div className="flex gap-1.5 mb-2 justify-start">
            {opponentPartyData.map((p: any, idx: number) => (
              <div
                key={p.id || idx}
                className={`w-3 h-3 rounded-full border border-slate-400 dark:border-slate-600 ${p.currentHp > 0 ? 'bg-red-500 shadow-sm' : 'bg-slate-400 dark:bg-slate-700 opacity-40'}`}
                title={`${p.name || p.speciesName || 'Pokemon'} (${p.currentHp > 0 ? 'Healthy' : 'Fainted'})`}
              ></div>
            ))}
          </div>
        ) : (
          <div className="flex gap-1.5 mb-2 justify-start">
            <div className={`w-3 h-3 rounded-full border border-slate-400 dark:border-slate-600 ${wild.currentHp > 0 ? 'bg-red-500 shadow-sm' : 'bg-slate-400 dark:bg-slate-700 opacity-40'}`}></div>
          </div>
        )}

        <HealthBar currentHp={wild.currentHp} maxHp={wild.maxHp} />
        <StatusIcons statusAilment={wild.statusAilment} />
      </div>

      {/* Wild Sprite (Top Right) */}
      <div className="absolute top-12 right-16 z-10">
        <PokemonSprite
          speciesId={wild.species?.id || wild.speciesId}
          speciesName={wild.name || wild.speciesName}
          isPlayer={false}
          className=""
        />
      </div>

      {/* Player Sprite (Bottom Left) */}
      <div className="absolute bottom-12 left-24 z-10">
        <PokemonSprite
          speciesId={player.species?.id || player.speciesId}
          speciesName={player.name || player.speciesName}
          isPlayer={true}
          className=""
        />
      </div>

      {/* Player Info Card (Bottom Right) */}
      <div className="absolute bottom-6 right-6 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-2xl w-96 z-20 text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-end mb-2 gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="text-xl font-bold capitalize tracking-wide drop-shadow-sm line-clamp-2 break-words">
              {player.name || player.nickname || player.speciesName}
            </h3>
            {player.types && (
              <div className="flex gap-1 mt-1">
                {player.types.map((t: string) => (
                  <img key={t} src={getTypeSpriteUrl(t)} alt={t} title={t} className="h-5 object-contain drop-shadow" />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0">
            {player.potential && (
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-400 dark:border-slate-600 rounded font-bold uppercase tracking-wider mb-0.5">
                {player.potential.replace('_', ' ')}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 drop-shadow-sm">Lv {player.level}</span>
              {player.potential && player.level >= ({ BLACK_IRON: 30, BRONZE: 60, SILVER: 90, GOLD: 120, PLATINUM: 150, ADAMANTITE: 200, DIAMOND: 300, CRYSTAL: 400, EPIC: 500, HEROIC: 700, SOVEREIGN: 900, LEGENDARY: 1100, DIVINE: 1400, CELESTIAL: 1700, PRIMORDIAL: 2000, MYTHICAL: 3000, INFINITY: 4000, ETERNAL: 5000 }[player.potential as string] || 5000) && (
                <span className="text-[10px] font-bold text-slate-100 bg-slate-900/50 border border-slate-700/50 px-1 rounded uppercase">Capped</span>
              )}
            </div>
          </div>
        </div>

        {/* Player Party Dots */}
        {playerPartyData && playerPartyData.length > 0 && (
          <div className="flex gap-1.5 mb-2 justify-end">
            {playerPartyData.map((p: any, idx: number) => (
              <div
                key={p.id || idx}
                className={`w-3 h-3 rounded-full border border-slate-400 dark:border-slate-600 ${p.currentHp > 0 ? 'bg-green-500 shadow-sm' : 'bg-slate-400 dark:bg-slate-700 opacity-40'}`}
                title={`${p.name || p.speciesName} (${p.currentHp > 0 ? 'Healthy' : 'Fainted'})`}
              ></div>
            ))}
          </div>
        )}

        <HealthBar currentHp={player.currentHp} maxHp={player.maxHp} />
        <StatusIcons statusAilment={player.statusAilment} />
      </div>
    </div>
  );
});
