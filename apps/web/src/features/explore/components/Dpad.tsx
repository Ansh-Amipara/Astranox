import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { MapDirection } from '@astranox/game-map';
import { EXPLORATION_CONSTANTS } from '@astranox/constants';

interface DpadProps {
  onMove: (direction: MapDirection) => void;
  disabled?: boolean;
}

export const Dpad: React.FC<DpadProps> = ({ onMove, disabled = false }) => {
  const activeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeDirectionRef = useRef<MapDirection | null>(null);

  const startMoving = (direction: MapDirection) => {
    if (disabled) return;
    activeDirectionRef.current = direction;
    onMove(direction);

    if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);
    activeIntervalRef.current = setInterval(() => {
      if (activeDirectionRef.current && !disabled) {
        onMove(activeDirectionRef.current);
      }
    }, EXPLORATION_CONSTANTS.MOVE_COOLDOWN_MS);
  };

  const stopMoving = () => {
    activeDirectionRef.current = null;
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
      activeIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);
    };
  }, []);

  const buttonClass =
    'flex items-center justify-center min-w-[52px] min-h-[52px] w-14 h-14 bg-surface active:bg-surface-raised border border-border text-foreground rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none touch-manipulation select-none';

  return (
    <div
      className="relative w-44 h-44 flex items-center justify-center select-none"
      role="group"
      aria-label="Directional Touch Controls"
    >
      {/* Up Button */}
      <button
        type="button"
        data-testid="dpad-up"
        disabled={disabled}
        className={`absolute top-0 ${buttonClass}`}
        onPointerDown={() => startMoving('UP')}
        onPointerUp={stopMoving}
        onPointerLeave={stopMoving}
        onPointerCancel={stopMoving}
        aria-label="Move Up"
      >
        <ChevronUp className="w-7 h-7" />
      </button>

      {/* Left Button */}
      <button
        type="button"
        data-testid="dpad-left"
        disabled={disabled}
        className={`absolute left-0 ${buttonClass}`}
        onPointerDown={() => startMoving('LEFT')}
        onPointerUp={stopMoving}
        onPointerLeave={stopMoving}
        onPointerCancel={stopMoving}
        aria-label="Move Left"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      {/* Center Spacer */}
      <div className="w-12 h-12 rounded-full border border-border/40 bg-surface/50" />

      {/* Right Button */}
      <button
        type="button"
        data-testid="dpad-right"
        disabled={disabled}
        className={`absolute right-0 ${buttonClass}`}
        onPointerDown={() => startMoving('RIGHT')}
        onPointerUp={stopMoving}
        onPointerLeave={stopMoving}
        onPointerCancel={stopMoving}
        aria-label="Move Right"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* Down Button */}
      <button
        type="button"
        data-testid="dpad-down"
        disabled={disabled}
        className={`absolute bottom-0 ${buttonClass}`}
        onPointerDown={() => startMoving('DOWN')}
        onPointerUp={stopMoving}
        onPointerLeave={stopMoving}
        onPointerCancel={stopMoving}
        aria-label="Move Down"
      >
        <ChevronDown className="w-7 h-7" />
      </button>
    </div>
  );
};
