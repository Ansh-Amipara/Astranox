import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface InventoryItemDto {
  id: string;
  itemId: string;
  quantity: number;
}

interface BallMenuProps {
  inventory: InventoryItemDto[];
  onThrowBall: (ballType: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const BALL_LABELS: Record<string, string> = {
  'poke-ball': 'Poké Ball (1.0x)',
  'great-ball': 'Great Ball (1.5x)',
  'ultra-ball': 'Ultra Ball (2.0x)',
  'luxury-ball': 'Luxury Ball (1.0x)',
  'master-ball': 'Master Ball (Guaranteed)',
};

export const BallMenu: React.FC<BallMenuProps> = ({
  inventory,
  onThrowBall,
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

  const availableBalls = inventory.filter((item) => {
    const lower = item.itemId.toLowerCase();
    return lower.includes('ball') && item.quantity > 0;
  });

  return (
    <div className="w-full flex flex-col gap-3" role="group" aria-label="Pokéball Selection Menu">
      {availableBalls.length === 0 ? (
        <div className="p-4 bg-surface border border-border rounded-xl text-center text-sm text-muted">
          <p className="font-bold text-foreground mb-1">No Pokéballs Available</p>
          <p className="text-xs">You do not have any Pokéballs in your inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {availableBalls.map((ball) => {
            const label = BALL_LABELS[ball.itemId.toLowerCase()] || ball.itemId;
            return (
              <button
                key={ball.id}
                type="button"
                disabled={disabled}
                onClick={() => onThrowBall(ball.itemId)}
                className="flex items-center justify-between p-3.5 bg-surface hover:bg-surface-raised active:scale-[0.98] border border-border rounded-xl text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40"
                aria-label={`Throw ${label}, count: ${ball.quantity}`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-sm">{label}</span>
                  <span className="text-xs text-muted font-mono">Count: x{ball.quantity}</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-foreground" />
              </button>
            );
          })}
        </div>
      )}

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
