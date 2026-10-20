import { memo } from 'react';

interface Props {
  currentHp: number;
  maxHp: number;
  hideText?: boolean;
  className?: string;
}

export const HealthBar = memo(function HealthBar({
  currentHp,
  maxHp,
  hideText = false,
  className = '',
}: Props) {
  const safeMax = Math.max(1, maxHp);
  const safeCurrent = Math.max(0, Math.min(currentHp, safeMax));
  const percentage = Math.max(0, (safeCurrent / safeMax) * 100);

  const color =
    percentage > 50
      ? 'bg-health-high'
      : percentage > 20
      ? 'bg-health-mid'
      : 'bg-health-low';

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full bg-surface-raised rounded-full h-2.5 sm:h-3 border border-border overflow-hidden relative shadow-inner"
        role="progressbar"
        aria-valuenow={safeCurrent}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={`HP: ${safeCurrent} of ${safeMax}`}
      >
        <div
          className={`h-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!hideText && (
        <div className="text-right mt-1 text-[11px] sm:text-xs text-muted font-bold font-sans">
          {safeCurrent} / {safeMax} HP
        </div>
      )}
    </div>
  );
});
