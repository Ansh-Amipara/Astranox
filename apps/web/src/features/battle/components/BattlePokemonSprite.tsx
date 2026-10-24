import { memo, useState } from 'react';
import { getSpriteUrl } from '@/lib/axios';

interface Props {
  speciesId: number;
  speciesName: string;
  isPlayer: boolean;
  isFainted?: boolean;
  isDamageFlash?: boolean;
  isHealPulse?: boolean;
  spriteUrl?: string;
  className?: string;
}

export const BattlePokemonSprite = memo(function BattlePokemonSprite({
  speciesId,
  speciesName,
  isPlayer,
  isFainted = false,
  isDamageFlash = false,
  isHealPulse = false,
  spriteUrl,
  className = '',
}: Props) {
  const [backSpriteFailed, setBackSpriteFailed] = useState(false);

  // Attempt back view for player Pokemon, fallback to front sprite if unavailable
  const backSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${speciesId}.png`;
  const frontSpriteUrl = getSpriteUrl(speciesId, spriteUrl);
  
  const currentSrc = isPlayer && !backSpriteFailed ? backSpriteUrl : frontSpriteUrl;
  const shouldFlipFront = isPlayer && backSpriteFailed;

  const animationClass = isFainted
    ? 'animate-faint motion-reduce:opacity-40'
    : isDamageFlash
    ? 'animate-damage-flash animate-damage-shake motion-reduce:animate-none'
    : isHealPulse
    ? 'animate-heal-pulse motion-reduce:animate-none'
    : '';

  return (
    <div className={`relative flex flex-col items-center justify-end select-none ${className}`}>
      {/* Ground platform / shadow built from semantic tokens */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] bg-surface-raised border border-border shadow-xs pointer-events-none transition-all ${
          isPlayer
            ? 'w-28 sm:w-44 md:w-56 h-6 sm:h-8'
            : 'w-24 sm:w-36 md:w-48 h-5 sm:h-7'
        }`}
        aria-hidden="true"
      />

      {/* Pokemon Sprite */}
      <img
        src={currentSrc}
        alt={speciesName}
        onError={() => {
          if (isPlayer && !backSpriteFailed) {
            setBackSpriteFailed(true);
          }
        }}
        className={`relative z-10 object-contain drop-shadow-md transition-all duration-300 ${
          isPlayer
            ? 'w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52'
            : 'w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48'
        } ${animationClass}`}
        style={{
          imageRendering: 'pixelated',
          transform: shouldFlipFront ? 'scaleX(-1)' : undefined,
        }}
      />
    </div>
  );
});
