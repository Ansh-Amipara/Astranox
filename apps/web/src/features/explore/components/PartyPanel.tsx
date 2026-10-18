import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PokemonSprite } from '@/components/ui/PokemonSprite';

interface PartyMemberDto {
  id: string;
  speciesId: number;
  speciesName: string;
  level: number;
  maxHp: number;
  currentHp: number;
  status: string;
}

interface PartyPanelProps {
  party: PartyMemberDto[];
  activePokemonId: string;
  onSwitch: (targetId: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const PartyPanel: React.FC<PartyPanelProps> = ({
  party,
  activePokemonId,
  onSwitch,
  onCancel,
  disabled = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, disabled]);

  return (
    <div className="w-full flex flex-col gap-3" role="group" aria-label="Party Pokémon Switch Menu">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {party.map((p) => {
          const isActive = p.id === activePokemonId;
          const isFainted = p.currentHp <= 0;
          const canSwitch = !isActive && !isFainted && !disabled;
          const hpPercent = Math.max(0, Math.min(100, (p.currentHp / (p.maxHp || 1)) * 100));

          return (
            <button
              key={p.id}
              type="button"
              disabled={!canSwitch}
              onClick={() => onSwitch(p.id)}
              className={`flex items-center gap-3 p-3 bg-surface border rounded-xl text-left transition-all ${
                isActive
                  ? 'border-foreground shadow-sm bg-surface-raised cursor-default'
                  : isFainted
                  ? 'opacity-40 border-border cursor-not-allowed'
                  : 'hover:bg-surface-raised border-border active:scale-[0.98]'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground`}
              aria-label={`${p.speciesName}, Level ${p.level}, HP ${p.currentHp} of ${p.maxHp}${
                isActive ? ' (Active)' : isFainted ? ' (Fainted)' : ''
              }`}
            >
              <div className="w-12 h-12 flex-shrink-0 bg-surface-raised rounded-lg border border-border/40 flex items-center justify-center overflow-hidden">
                <PokemonSprite speciesId={p.speciesId} size="md" alt={p.speciesName} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm truncate">{p.speciesName}</span>
                  <span className="text-xs text-muted font-mono">Lv.{p.level}</span>
                </div>

                <div className="mt-1.5 w-full bg-surface-raised h-2 rounded-full overflow-hidden border border-border/40">
                  <div
                    className={`h-full transition-all duration-300 ${
                      hpPercent > 50
                        ? 'bg-health-high'
                        : hpPercent > 20
                        ? 'bg-health-mid'
                        : 'bg-health-low'
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-muted font-mono">
                  <span>
                    {p.currentHp} / {p.maxHp} HP
                  </span>
                  {isActive && <span className="font-bold text-foreground uppercase">Active</span>}
                  {isFainted && <span className="text-danger font-bold uppercase">Fainted</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onCancel}
        className="w-full py-2.5 px-4 bg-surface-raised hover:bg-surface border border-border text-muted hover:text-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
        aria-label="Back to main battle menu"
      >
        <ArrowLeft className="w-4 h-4" /> Back (Esc)
      </button>
    </div>
  );
};
