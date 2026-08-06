import { memo } from 'react';
import { getSpriteUrl } from '@/shared/api/api';

interface Props {
  speciesId: number;
  speciesName: string;
  isPlayer: boolean;
  className?: string;
}

export const PokemonSprite = memo(function PokemonSprite({ speciesId, speciesName, isPlayer, className = '' }: Props) {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-24 sm:w-48 h-6 sm:h-12 bg-black/30 dark:bg-black/50 blur-lg sm:blur-xl rounded-full"></div>
      <img 
        src={getSpriteUrl(speciesId)}
        className={`relative w-32 h-32 sm:w-64 sm:h-64 object-contain`}
        style={{ imageRendering: 'pixelated', transform: isPlayer ? 'scaleX(-1)' : undefined }}
        alt={speciesName}
      />
    </div>
  );
});
