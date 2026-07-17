import { memo } from 'react';
import { PokemonSprite } from '../../../entities/pokemon/ui/PokemonSprite';
import { HealthBar } from '../../../shared/ui/HealthBar';
import { StatusIcons } from '../../../shared/ui/StatusIcons';
import { WeatherEffects } from './WeatherEffects';

interface Props {
  wild: any;
  player: any;
  opponentPartyData: any[];
  playerPartyData: any[];
  battleType: string;
}

export const BattleArena = memo(function BattleArena({ wild, player, opponentPartyData, playerPartyData, battleType }: Props) {
  return (
    <div 
      className="relative z-10 flex-1 flex flex-col justify-between p-4 bg-cover bg-center bg-no-repeat min-h-0 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]"
      style={{ backgroundImage: "url('/battle-bg.png')" }}
    >
      <WeatherEffects weather={null} />

      {/* Wild Info Card (Top Left) */}
      <div className="absolute top-6 left-6 bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl w-80 z-20 text-white">
        <div className="flex justify-between items-end mb-2 gap-2">
          <h2 className="text-2xl font-bold capitalize tracking-wide drop-shadow-sm truncate">{wild.speciesName}</h2>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-300 drop-shadow-sm">Lv {wild.level}</span>
            </div>
          </div>
        </div>

        {/* Enemy Party Indicators (NPC only) */}
        {battleType === 'NPC' && opponentPartyData.length > 0 && (
          <div className="flex gap-1 mb-2">
            {opponentPartyData.map((p: any) => (
              <div
                key={p.id}
                className={`w-3 h-3 rounded-full ${p.currentHp > 0 ? 'bg-red-500 shadow-sm' : 'bg-slate-500/50'}`}
                title={p.currentHp > 0 ? 'Healthy' : 'Fainted'}
              ></div>
            ))}
          </div>
        )}

        <HealthBar currentHp={wild.currentHp} maxHp={wild.maxHp} />
        <StatusIcons statusAilment={wild.statusAilment} />
      </div>

      {/* Wild Sprite (Top Right) */}
      <div className="absolute top-12 right-16 z-10">
        <PokemonSprite
          speciesId={wild.speciesId}
          speciesName={wild.speciesName}
          isPlayer={false}
          className=""
        />
      </div>

      {/* Player Sprite (Bottom Left) */}
      <div className="absolute bottom-12 left-24 z-10">
        <PokemonSprite
          speciesId={player.speciesId}
          speciesName={player.speciesName}
          isPlayer={true}
          className=""
        />
      </div>

      {/* Player Info Card (Bottom Right) */}
      <div className="absolute bottom-6 right-6 bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl w-80 z-20 text-white">
        <div className="flex justify-between items-end mb-2 gap-2">
          <h3 className="text-xl font-bold capitalize tracking-wide drop-shadow-sm truncate">
            {player.nickname || player.speciesName}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            {player.potential && (
              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 rounded font-bold uppercase tracking-wider mb-0.5">
                {player.potential.replace('_', ' ')}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-300 drop-shadow-sm">Lv {player.level}</span>
              {player.potential && player.level >= ({ BLACK_IRON: 20, BRONZE: 40, SILVER: 60, GOLD: 80, PLATINUM: 90, DIAMOND: 100, EPIC: 120, LEGENDARY: 150, MYTHICAL: 200 }[player.potential as string] || 200) && (
                <span className="text-[10px] font-bold text-red-400 bg-red-900/50 border border-red-500/50 px-1 rounded uppercase">Capped</span>
              )}
            </div>
          </div>
        </div>

        {/* Player Party Indicators */}
        {playerPartyData && playerPartyData.length > 0 && (
          <div className="flex gap-1 mb-2 justify-end">
            {playerPartyData.map((p: any) => (
              <div
                key={p.id}
                className={`w-3 h-3 rounded-full ${p.currentHp > 0 ? 'bg-red-500 shadow-sm' : 'bg-slate-500/50'}`}
                title={p.currentHp > 0 ? 'Healthy' : 'Fainted'}
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
