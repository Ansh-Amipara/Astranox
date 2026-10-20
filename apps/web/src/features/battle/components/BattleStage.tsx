import { memo, useEffect, useRef, useState } from 'react';
import { PokemonInfoCard } from './PokemonInfoCard';
import { BattlePokemonSprite } from './BattlePokemonSprite';
import { WeatherEffects } from './WeatherEffects';
import { ActivePokemonDto, OwnedPokemonDto } from '@astranox/types';

interface Props {
  wild: ActivePokemonDto & { name?: string; speciesName?: string; isCorrupted?: boolean; statusAilment?: string };
  player: ActivePokemonDto & { name?: string; nickname?: string; speciesName?: string; statusAilment?: string };
  opponentPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
  playerPartyData: (OwnedPokemonDto & { currentHp: number; maxHp: number; name?: string })[];
  className?: string;
}

export const BattleStage = memo(function BattleStage({
  wild,
  player,
  opponentPartyData,
  playerPartyData,
  className = '',
}: Props) {
  // Opponent damage/heal flash tracking
  const [wildFlash, setWildFlash] = useState<'damage' | 'heal' | null>(null);
  const prevWildHpRef = useRef(wild.currentHp);
  useEffect(() => {
    if (wild.currentHp < prevWildHpRef.current) {
      setWildFlash('damage');
    } else if (wild.currentHp > prevWildHpRef.current) {
      setWildFlash('heal');
    }
    prevWildHpRef.current = wild.currentHp;
    const t = setTimeout(() => setWildFlash(null), 500);
    return () => clearTimeout(t);
  }, [wild.currentHp]);

  // Player damage/heal flash tracking
  const [playerFlash, setPlayerFlash] = useState<'damage' | 'heal' | null>(null);
  const prevPlayerHpRef = useRef(player.currentHp);
  useEffect(() => {
    if (player.currentHp < prevPlayerHpRef.current) {
      setPlayerFlash('damage');
    } else if (player.currentHp > prevPlayerHpRef.current) {
      setPlayerFlash('heal');
    }
    prevPlayerHpRef.current = player.currentHp;
    const t = setTimeout(() => setPlayerFlash(null), 500);
    return () => clearTimeout(t);
  }, [player.currentHp]);

  return (
    <div
      className={`relative w-full flex-1 flex flex-col justify-between p-2 sm:p-4 md:p-6 bg-surface overflow-hidden transition-colors select-none ${className}`}
    >
      <WeatherEffects weather={null} />

      {/* Opponent Zone (Top): Info card on the left, Sprite on the right */}
      <section
        className="w-full flex items-center justify-between sm:justify-around gap-2 sm:gap-6 min-h-[95px] sm:min-h-[140px] z-10"
        aria-label="Opponent Pokémon"
      >
        <PokemonInfoCard
          isPlayer={false}
          name={wild.name || wild.speciesName}
          level={wild.level}
          currentHp={wild.currentHp}
          maxHp={wild.maxHp}
          types={wild.types}
          statusAilment={wild.statusAilment}
          partyData={opponentPartyData}
          isCorrupted={wild.isCorrupted}
        />

        <BattlePokemonSprite
          speciesId={wild.speciesId}
          speciesName={wild.name || wild.speciesName}
          isPlayer={false}
          isFainted={wild.currentHp <= 0}
          isDamageFlash={wildFlash === 'damage'}
          isHealPulse={wildFlash === 'heal'}
        />
      </section>

      {/* Player Zone (Middle-Bottom): Sprite on the left, Info card on the right */}
      <section
        className="w-full flex items-center justify-between sm:justify-around gap-2 sm:gap-6 min-h-[105px] sm:min-h-[155px] z-10"
        aria-label="Player Pokémon"
      >
        <BattlePokemonSprite
          speciesId={player.speciesId}
          speciesName={player.name || player.speciesName}
          isPlayer={true}
          isFainted={player.currentHp <= 0}
          isDamageFlash={playerFlash === 'damage'}
          isHealPulse={playerFlash === 'heal'}
        />

        <PokemonInfoCard
          isPlayer={true}
          name={player.name || player.nickname || player.speciesName}
          level={player.level}
          currentHp={player.currentHp}
          maxHp={player.maxHp}
          types={player.types}
          statusAilment={player.statusAilment}
          partyData={playerPartyData}
          potential={player.potential}
        />
      </section>
    </div>
  );
});
