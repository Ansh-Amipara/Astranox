import { memo } from 'react';
import { getSpriteUrl } from '../../services/api';

interface Props {
  speciesId: number;
  speciesName: string;
  isPlayer: boolean;
  className?: string;
}

export const PokemonSprite = memo(function PokemonSprite({ speciesId, speciesName, isPlayer, className = '' }: Props) {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/30 dark:bg-black/50 blur-xl rounded-full"></div>
      <img 
        src={getSpriteUrl(speciesId)}
        className={`relative w-64 h-64 object-contain ${!isPlayer ? 'animate-bounce' : ''}`}
        style={{ imageRendering: 'pixelated', transform: isPlayer ? 'scaleX(-1)' : undefined }}
        alt={speciesName}
      />
    </div>
  );
});
