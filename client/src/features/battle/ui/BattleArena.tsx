import { memo } from 'react';
import { PokemonSprite } from '../../../entities/pokemon/ui/PokemonSprite';
import { HealthBar } from '../../../shared/ui/HealthBar';
import { StatusIcons } from '../../../shared/ui/StatusIcons';
import { WeatherEffects } from './WeatherEffects';

interface Props {
  wild: any;
  player: any;
  opponentPartyData: any[];
  battleType: string;
}

export const BattleArena = memo(function BattleArena({ wild, player, opponentPartyData, battleType }: Props) {
  return (
    <div 
      className="relative z-10 flex-1 flex flex-col justify-between p-4 bg-cover bg-center bg-no-repeat min-h-0 overflow-hidden"
      style={{ backgroundImage: "url('/battle-bg.png')" }}
    >
      <WeatherEffects weather={null} />

      {/* Top Half: Wild Pokemon */}
      <div className="flex justify-end w-full max-w-5xl mx-auto mt-2 relative shrink-0">
        
        {/* Wild Sprite */}
        <PokemonSprite 
          speciesId={wild.speciesId} 
          speciesName={wild.speciesName} 
          isPlayer={false} 
          className="absolute right-[200px] top-12"
        />

        {/* Wild Info Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl w-80 mb-4 z-10">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize tracking-wide">{wild.speciesName}</h2>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">Lv {wild.level}</span>
          </div>
          
          {/* Enemy Party Indicators (NPC only) */}
          {battleType === 'NPC' && opponentPartyData.length > 0 && (
            <div className="flex gap-1 mb-2">
              {opponentPartyData.map((p: any) => (
                <div 
                  key={p.id} 
                  className={`w-3 h-3 rounded-full ${p.currentHp > 0 ? 'bg-red-500' : 'bg-slate-400 dark:bg-slate-700'}`} 
                  title={p.currentHp > 0 ? 'Healthy' : 'Fainted'}
                ></div>
              ))}
            </div>
          )}
          
          <HealthBar currentHp={wild.currentHp} maxHp={wild.maxHp} />
          <StatusIcons statusAilment={wild.statusAilment} />
        </div>
      </div>

      {/* Spacer to push player to bottom */}
      <div className="flex-1"></div>

      {/* Bottom Half: Player Pokemon */}
      <div className="flex justify-start w-full max-w-5xl mx-auto mb-2 shrink-0 z-10">
        <PokemonSprite 
          speciesId={player.speciesId} 
          speciesName={player.speciesName} 
          isPlayer={true} 
          className="mt-4 ml-[200px] -translate-y-8"
        />
        
        {/* Player Info Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl w-80 ml-12 self-end">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize tracking-wide drop-shadow-sm">
              {player.nickname || player.speciesName}
            </h3>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Lv{player.level}
            </span>
          </div>
          
          <HealthBar currentHp={player.currentHp} maxHp={player.maxHp} />
          <StatusIcons statusAilment={player.statusAilment} />
        </div>
      </div>
    </div>
  );
});
