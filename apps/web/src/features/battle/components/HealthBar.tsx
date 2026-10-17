import { memo } from 'react';

interface Props {
  currentHp: number;
  maxHp: number;
  hideText?: boolean;
}

export const HealthBar = memo(function HealthBar({ currentHp, maxHp, hideText }: Props) {
  const percentage = Math.max(0, (currentHp / maxHp) * 100);
  const color = percentage > 50 ? 'bg-health-high' : percentage > 20 ? 'bg-health-mid' : 'bg-health-low';

  return (
    <>
      <div className="w-full bg-surface-raised rounded-full h-3 sm:h-4 border-2 border-border overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-500 ${color}`} 
          style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '1%' : '0%' }}
        ></div>
      </div>
      {!hideText && (
        <div className="text-right mt-1 text-xs text-muted font-bold">
          {currentHp} / {maxHp}
        </div>
      )}
    </>
  );
});
