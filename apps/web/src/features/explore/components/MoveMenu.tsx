import React, { useEffect } from 'react';
import { MoveData } from '@astranox/battle-engine';
import { ArrowLeft } from 'lucide-react';

interface MoveMenuProps {
  moves: MoveData[];
  onSelectMove: (moveId: number) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const MoveMenu: React.FC<MoveMenuProps> = ({
  moves,
  onSelectMove,
  onCancel,
  disabled = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= moves.length) {
        onSelectMove(moves[num - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moves, onSelectMove, onCancel, disabled]);

  return (
    <div className="w-full flex flex-col gap-3" role="group" aria-label="Battle Moves Menu">
      <div className="grid grid-cols-2 gap-2.5">
        {moves.map((move, idx) => (
          <button
            key={move.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectMove(move.id)}
            className="group flex flex-col items-start p-3.5 bg-surface hover:bg-surface-raised active:scale-[0.98] border border-border rounded-xl text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40"
            aria-label={`${move.name}, Power ${move.power}, Type ${move.type}`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="font-bold text-foreground group-hover:underline text-sm md:text-base">
                {move.name}
              </span>
              <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-border text-muted">
                {idx + 1}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted font-mono">
              <span className="uppercase">{move.type}</span>
              <span>•</span>
              <span>PWR {move.power || '—'}</span>
            </div>
          </button>
        ))}
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
