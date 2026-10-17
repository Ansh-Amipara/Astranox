import { memo } from 'react';

interface Props {
  currentHp: number;
  maxHp: number;
  hideText?: boolean;
}

export const HealthBar = memo(function HealthBar({ currentHp, maxHp, hideText }: Props) {
  const percentage = Math.max(0, (currentHp / maxHp) * 100);
  const color = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 sm:h-4 border-2 border-slate-300 dark:border-slate-900 overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-500 ${color}`} 
          style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '1%' : '0%' }}
        ></div>
      </div>
      {!hideText && (
        <div className="text-right mt-1 text-xs text-slate-500 dark:text-slate-400 font-bold">
          {currentHp} / {maxHp}
        </div>
      )}
    </>
  );
});
