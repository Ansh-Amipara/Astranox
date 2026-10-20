import { memo } from 'react';
import { GiBackpack } from 'react-icons/gi';
import { TbPokeball } from 'react-icons/tb';
import { FaRunning } from 'react-icons/fa';

interface Props {
  isPending: boolean;
  battleType?: string;
  onOpenBag: () => void;
  onOpenParty: () => void;
  onRun: () => void;
  className?: string;
}

export const ActionBar = memo(function ActionBar({
  isPending,
  battleType = 'WILD',
  onOpenBag,
  onOpenParty,
  onRun,
  className = '',
}: Props) {
  const isWild = battleType === 'WILD';
  const canRun = isWild && !isPending;
  const canUseBag = isWild && !isPending;

  return (
    <div
      className={`grid grid-cols-3 gap-2 w-full ${className}`}
      role="group"
      aria-label="Battle actions"
    >
      {/* Bag Button */}
      <button
        type="button"
        onClick={onOpenBag}
        disabled={!canUseBag}
        title={isWild ? 'Open Bag' : 'Cannot use Bag items in trainer or arena battles'}
        className="min-h-[44px] px-2.5 py-2 bg-surface hover:bg-surface-raised active:bg-surface-raised text-foreground rounded-xl border border-border shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Bag items"
      >
        <GiBackpack className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-foreground" aria-hidden="true" />
        <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">Bag</span>
      </button>

      {/* Switch Party Button */}
      <button
        type="button"
        onClick={onOpenParty}
        disabled={isPending}
        title="Switch Pokémon"
        className="min-h-[44px] px-2.5 py-2 bg-surface hover:bg-surface-raised active:bg-surface-raised text-foreground rounded-xl border border-border shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Switch active Pokémon"
      >
        <TbPokeball className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-foreground" aria-hidden="true" />
        <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">Switch</span>
      </button>

      {/* Run / Escape Button */}
      <button
        type="button"
        onClick={onRun}
        disabled={!canRun}
        title={isWild ? 'Attempt to escape from battle' : 'Cannot flee from a trainer battle'}
        className="min-h-[44px] px-2.5 py-2 bg-surface hover:bg-surface-raised active:bg-surface-raised text-foreground rounded-xl border border-border shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={isWild ? 'Run from battle' : 'Cannot run from trainer battle'}
      >
        <FaRunning className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-foreground" aria-hidden="true" />
        <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">Run</span>
      </button>
    </div>
  );
});
