import React from 'react';

interface RealmBackdropProps {
  themeKey: string;
  className?: string;
  children?: React.ReactNode;
}

export const RealmBackdrop: React.FC<RealmBackdropProps> = ({
  themeKey,
  className = '',
  children,
}) => {
  const getThemeStyles = () => {
    switch (themeKey) {
      case 'volcano':
        return {
          accent: 'border-type-fire/30',
          badgeBg: 'bg-type-fire/15 text-type-fire border-type-fire/30',
          glow: 'bg-type-fire/5',
        };
      case 'ocean':
        return {
          accent: 'border-type-water/30',
          badgeBg: 'bg-type-water/15 text-type-water border-type-water/30',
          glow: 'bg-type-water/5',
        };
      case 'storm-peaks':
        return {
          accent: 'border-type-electric/30',
          badgeBg: 'bg-type-electric/15 text-type-electric border-type-electric/30',
          glow: 'bg-type-electric/5',
        };
      case 'forest':
        return {
          accent: 'border-type-grass/30',
          badgeBg: 'bg-type-grass/15 text-type-grass border-type-grass/30',
          glow: 'bg-type-grass/5',
        };
      case 'shadow-hollow':
        return {
          accent: 'border-type-ghost/30',
          badgeBg: 'bg-type-ghost/15 text-type-ghost border-type-ghost/30',
          glow: 'bg-type-ghost/5',
        };
      case 'mind-temple':
        return {
          accent: 'border-type-psychic/30',
          badgeBg: 'bg-type-psychic/15 text-type-psychic border-type-psychic/30',
          glow: 'bg-type-psychic/5',
        };
      case 'iron-dojo':
        return {
          accent: 'border-type-steel/30',
          badgeBg: 'bg-type-steel/15 text-type-steel border-type-steel/30',
          glow: 'bg-type-steel/5',
        };
      default:
        return {
          accent: 'border-border',
          badgeBg: 'bg-surface-raised text-foreground border-border',
          glow: 'bg-surface-raised',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${theme.accent} bg-surface-raised transition-all duration-300 ${className}`}
    >
      {/* Thematic subtle glow */}
      <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none select-none ${theme.glow}`} />

      {/* Subtle atmospheric SVG grid overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5 pointer-events-none select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`pattern-${themeKey}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-${themeKey})`} />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
};
