import { memo } from 'react';
import { getTypeSpriteUrl } from '@/lib/axios';
import { PokemonMoveDto } from '@astranox/types';

interface Props {
  moves: PokemonMoveDto[];
  isPending: boolean;
  disabled?: boolean;
  onMoveSelect: (moveAction: string) => void;
  className?: string;
}

const typeBorderClassMap: Record<string, string> = {
  normal: 'border-l-type-normal',
  fire: 'border-l-type-fire',
  water: 'border-l-type-water',
  grass: 'border-l-type-grass',
  electric: 'border-l-type-electric',
  ice: 'border-l-type-ice',
  fighting: 'border-l-type-fighting',
  poison: 'border-l-type-poison',
  ground: 'border-l-type-ground',
  flying: 'border-l-type-flying',
  psychic: 'border-l-type-psychic',
  bug: 'border-l-type-bug',
  rock: 'border-l-type-rock',
  ghost: 'border-l-type-ghost',
  dragon: 'border-l-type-dragon',
  steel: 'border-l-type-steel',
  dark: 'border-l-type-dark',
  fairy: 'border-l-type-fairy',
};

export const MovePanel = memo(function MovePanel({
  moves,
  isPending,
  disabled = false,
  onMoveSelect,
  className = '',
}: Props) {
  const isDisabled = disabled || isPending;
  const emptyCount = Math.max(0, 4 - (moves?.length || 0));

  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 w-full ${className}`}
      role="group"
      aria-label="Battle moves"
    >
      {(moves || []).map((move, i) => {
        const moveName = (
          (move as any).name ||
          (move as any).move?.name ||
          'Unknown'
        ).replace(/-/g, ' ');

        const typeKey = (move.type || 'normal').toLowerCase();
        const borderClass = typeBorderClassMap[typeKey] || 'border-l-border';

        const category =
          (move as any).damageClass ||
          (move as any).category ||
          ((move as any).power && (move as any).power > 0 ? 'Physical' : 'Status');

        const power = (move as any).power;
        const accuracy = (move as any).accuracy;

        return (
          <button
            key={move.moveId ? `move-${move.moveId}-${i}` : i}
            type="button"
            onClick={() => onMoveSelect(`move:${move.moveId}`)}
            disabled={isDisabled}
            className={`min-h-[48px] sm:min-h-[52px] p-2 sm:p-2.5 bg-surface hover:bg-surface-raised active:bg-surface-raised text-foreground rounded-xl border border-border border-l-4 ${borderClass} shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all flex flex-col justify-between gap-1 touch-manipulation select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            aria-label={`Use move ${moveName}, ${move.type} type, ${category} category`}
          >
            {/* Top row: Type icon + category tag */}
            <div className="flex items-center justify-between gap-1 w-full pointer-events-none">
              <div className="flex items-center gap-1 min-w-0">
                <img
                  src={getTypeSpriteUrl(move.type, true)}
                  alt=""
                  aria-hidden="true"
                  className="h-3.5 sm:h-4 w-auto object-contain drop-shadow-xs shrink-0"
                />
                <span className="text-[10px] font-bold text-muted capitalize truncate">
                  {move.type}
                </span>
              </div>

              <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 bg-surface-raised border border-border/80 text-muted rounded shrink-0">
                {category}
              </span>
            </div>

            {/* Middle row: Move name (no truncation, wraps smoothly) */}
            <div className="w-full text-left pointer-events-none">
              <span className="font-bold text-xs sm:text-sm text-foreground capitalize tracking-tight leading-tight line-clamp-2 break-words">
                {moveName}
              </span>
            </div>

            {/* Bottom row: Power and Accuracy (only if present in move data) */}
            {(power !== undefined || accuracy !== undefined) && (
              <div className="flex items-center justify-between text-[10px] font-bold text-subtle w-full pointer-events-none pt-0.5">
                {power !== undefined && (
                  <span>Pwr {power > 0 ? power : '—'}</span>
                )}
                {accuracy !== undefined && (
                  <span className="ml-auto">Acc {accuracy ? `${accuracy}%` : '—'}</span>
                )}
              </div>
            )}
          </button>
        );
      })}

      {/* Render empty move slots */}
      {Array.from({ length: emptyCount }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="min-h-[48px] sm:min-h-[52px] p-2 bg-surface-raised/40 border border-dashed border-border/60 rounded-xl flex items-center justify-center text-muted/40 text-xs font-bold select-none"
          aria-hidden="true"
        >
          <span>—</span>
        </div>
      ))}
    </div>
  );
});
