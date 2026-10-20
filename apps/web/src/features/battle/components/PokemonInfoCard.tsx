import { memo, useEffect, useRef, useState } from 'react';
import { HealthBar } from './HealthBar';
import { PartyIndicator, PartyMemberStatus } from './PartyIndicator';
import { getTypeSpriteUrl } from '@/lib/axios';
import { formatPotential } from '@/features/pokemon/pokemonUtils';

export interface PokemonInfoCardProps {
  isPlayer: boolean;
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  types?: string[];
  statusAilment?: string | null;
  partyData?: PartyMemberStatus[];
  potential?: string | null;
  isCorrupted?: boolean;
  className?: string;
}

export const PokemonInfoCard = memo(function PokemonInfoCard({
  isPlayer,
  name,
  level,
  currentHp,
  maxHp,
  types,
  statusAilment,
  partyData,
  potential,
  isCorrupted,
  className = '',
}: PokemonInfoCardProps) {
  const [flash, setFlash] = useState<'damage' | 'heal' | null>(null);
  const prevHpRef = useRef(currentHp);

  useEffect(() => {
    const prevHp = prevHpRef.current;
    if (prevHp !== currentHp) {
      if (currentHp < prevHp) {
        setFlash('damage');
      } else if (currentHp > prevHp) {
        setFlash('heal');
      }
      prevHpRef.current = currentHp;
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [currentHp]);

  const isFainted = currentHp <= 0;

  const animationClasses = flash === 'damage'
    ? 'animate-damage-shake motion-reduce:animate-none'
    : flash === 'heal'
    ? 'animate-heal-pulse motion-reduce:animate-none'
    : '';

  return (
    <article
      className={`bg-surface/95 backdrop-blur-md rounded-2xl p-2 sm:p-3 md:p-3.5 shadow-md flex flex-col gap-1.5 w-full max-w-[220px] sm:max-w-[270px] md:max-w-[310px] text-foreground transition-all duration-200 select-none ${animationClasses} ${
        isFainted ? 'border-2 border-health-low/70 opacity-80' : 'border border-border'
      } ${className}`}
      aria-label={`${isPlayer ? 'Player' : 'Opponent'} ${name}, Level ${level}, ${currentHp} of ${maxHp} HP`}
    >
      {/* Top Row: Name, Level, and Potential */}
      <div className="flex items-start justify-between gap-1.5 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <h2 className="text-xs sm:text-sm md:text-base font-bold capitalize text-foreground truncate tracking-tight">
            {name}
          </h2>
          {isCorrupted && (
            <span className="px-1 py-0.5 bg-surface-raised text-muted border border-border/80 rounded text-[9px] font-black uppercase tracking-wider shrink-0">
              Corrupted
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 font-sans">
          {isPlayer && potential && (
            <span
              className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-surface-raised border border-border rounded font-extrabold uppercase tracking-wider text-muted shrink-0"
              title={`Potential Tier: ${formatPotential(potential)}`}
              aria-label={`Potential Tier: ${formatPotential(potential)}`}
            >
              Tier {formatPotential(potential)}
            </span>
          )}
          <span className="text-xs sm:text-sm font-extrabold text-muted">
            Lv {level}
          </span>
        </div>
      </div>

      {/* Middle Row: Types, Status, and Party Indicator */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 shrink-0">
          {types && types.length > 0 && (
            <div className="flex gap-0.5 sm:gap-1">
              {types.map((type) => (
                <img
                  key={type}
                  src={getTypeSpriteUrl(type, true)}
                  alt={type}
                  title={type}
                  className="h-3.5 sm:h-4 w-auto object-contain drop-shadow-xs"
                />
              ))}
            </div>
          )}

          {statusAilment && (
            <span className="bg-surface-raised text-foreground border border-border text-[9px] font-black uppercase px-1 sm:px-1.5 py-0.5 rounded tracking-wider shadow-xs">
              {statusAilment}
            </span>
          )}
        </div>

        {/* Party Member Dots */}
        <PartyIndicator
          party={partyData}
          singleFallbackHp={currentHp}
          className="shrink-0 ml-auto"
        />
      </div>

      {/* HP Bar */}
      <div className="w-full pt-0.5">
        <HealthBar currentHp={currentHp} maxHp={maxHp} hideText={true} />
      </div>

      {/* Bottom Numeric HP readout */}
      <div className="flex items-center justify-end text-[11px] sm:text-xs font-bold tabular-nums -mt-0.5">
        {isFainted ? (
          <span className="text-health-low font-extrabold uppercase tracking-wide">
            Fainted (0 / {maxHp} HP)
          </span>
        ) : (
          <span className="text-muted">
            {currentHp} / {maxHp} HP
          </span>
        )}
      </div>
    </article>
  );
});
