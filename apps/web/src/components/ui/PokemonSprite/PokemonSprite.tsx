import React, { useState } from 'react';
import { clsx } from 'clsx';
import { HelpCircle } from 'lucide-react';
import { getSpriteUrl } from '@/lib/axios';
import { getOptimizedCloudinaryUrl } from '@/lib/sprite';
import { Skeleton } from '@/components/ui/Skeleton';

export interface PokemonSpriteProps extends React.HTMLAttributes<HTMLDivElement> {
  speciesId?: number | string;
  spriteUrl?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  pixelated?: boolean;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
  custom: '',
};

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
  speciesId,
  spriteUrl,
  alt = 'Pokémon sprite',
  size = 'md',
  width,
  height,
  priority = false,
  pixelated = true,
  fallbackIcon,
  className,
  style,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Compute source URL
  const rawUrl = spriteUrl || (speciesId !== undefined ? getSpriteUrl(speciesId) : '');
  const finalUrl = getOptimizedCloudinaryUrl(rawUrl);

  const dimensionStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsLoaded(true);
    setHasError(true);
    onError?.();
  };

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center shrink-0 aspect-square select-none',
        size !== 'custom' && sizeClasses[size],
        className
      )}
      style={dimensionStyles}
      {...props}
    >
      {/* Skeleton while loading */}
      {!isLoaded && !hasError && (
        <Skeleton
          variant="rectangular"
          className="absolute inset-0 w-full h-full rounded-lg"
        />
      )}

      {/* Fallback state on error or missing URL */}
      {(hasError || !finalUrl) ? (
        <div
          className="w-full h-full flex items-center justify-center rounded-lg bg-surface border border-border text-subtle"
          title={alt}
          role="img"
          aria-label={alt}
        >
          {fallbackIcon || <HelpCircle className="w-1/2 h-1/2 text-muted" />}
        </div>
      ) : (
        <img
          src={finalUrl}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={clsx(
            'w-full h-full object-contain transition-opacity duration-150',
            pixelated && 'image-pixelated',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            imageRendering: pixelated ? 'pixelated' : 'auto',
          }}
        />
      )}
    </div>
  );
};
