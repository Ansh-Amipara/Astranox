import { memo } from 'react';
import { MovePanel } from './MovePanel';
import { ActionBar } from './ActionBar';
import { ActivePokemonDto, TurnEventDto, PokemonMoveDto } from '@astranox/types';
import { ScrollText, Sparkles } from 'lucide-react';

interface Props {
  player: ActivePokemonDto & { name?: string; nickname?: string; speciesName?: string };
  status: string;
  rawEvents: TurnEventDto[];
  isPending: boolean;
  isFinished: boolean;
  isWaitingSwitch: boolean;
  battleType?: string;
  lastTurnEvents?: string[];
  onMoveSelect: (moveAction: string) => void;
  onSkipMove: () => void;
  onRun: () => void;
  onOpenBag: () => void;
  onOpenParty: () => void;
  onOpenMobileLog?: () => void;
  className?: string;
}

export const BattleControls = memo(function BattleControls({
  player,
  status,
  rawEvents,
  isPending,
  isFinished,
  isWaitingSwitch,
  battleType = 'WILD',
  lastTurnEvents = [],
  onMoveSelect,
  onSkipMove,
  onRun,
  onOpenBag,
  onOpenParty,
  onOpenMobileLog,
  className = '',
}: Props) {
  if (isFinished) {
    return null;
  }

  // WAITING_MOVE_LEARN flow
  if (status === 'WAITING_MOVE_LEARN') {
    const learnEvent = rawEvents.find((e) => e.type === 'prompt_learn_move');
    const newMoveName = (learnEvent as any)?.moveName || 'a new move';
    const monName = player.nickname || player.speciesName;

    return (
      <div className={`w-full bg-surface/95 backdrop-blur-md border-t border-border p-3 sm:p-4 shadow-xl z-20 flex flex-col gap-3 ${className}`}>
        <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground">
            <Sparkles className="w-4 h-4 text-warning shrink-0" aria-hidden="true" />
            <span>
              <strong className="capitalize">{monName}</strong> wants to learn{' '}
              <span className="uppercase text-foreground font-black">{newMoveName}</span>! Choose a move to forget:
            </span>
          </div>

          <button
            type="button"
            onClick={onSkipMove}
            disabled={isPending}
            className="min-h-[44px] px-3.5 py-1.5 bg-surface-raised hover:bg-surface border border-border text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-xs touch-manipulation select-none disabled:opacity-50"
          >
            Skip
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(player.moves || []).map((move: PokemonMoveDto, i: number) => {
            const moveName = ((move as any).name || (move as any).move?.name || 'Unknown').replace(/-/g, ' ');
            return (
              <button
                key={i}
                type="button"
                onClick={() => onMoveSelect(`learn_move:${i}`)}
                disabled={isPending}
                className="min-h-[48px] p-2.5 bg-surface hover:bg-surface-raised active:bg-surface-raised text-foreground rounded-xl border border-border hover:border-danger/40 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center gap-0.5 touch-manipulation select-none disabled:opacity-50"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-danger">
                  Forget
                </span>
                <span className="font-bold text-xs sm:text-sm capitalize truncate max-w-full">
                  {moveName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Turn prompt text
  const promptText = isWaitingSwitch
    ? 'Choose your next Pokémon!'
    : isPending
    ? 'Resolving turn...'
    : 'What will you do?';

  const latestEvent = lastTurnEvents.length > 0 ? lastTurnEvents[lastTurnEvents.length - 1] : null;

  return (
    <div
      className={`w-full bg-surface/95 backdrop-blur-md border-t border-border p-2.5 sm:p-4 shadow-xl z-20 flex flex-col gap-2 sm:gap-3 transition-colors ${className}`}
    >
      {/* Turn Header: Prompt on the left, Log toggle pill on mobile */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight truncate">
            {promptText}
          </span>
        </div>

        {/* Mobile Log Drawer Button */}
        {onOpenMobileLog && (
          <button
            type="button"
            onClick={onOpenMobileLog}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised hover:bg-surface border border-border rounded-lg text-xs font-bold text-muted hover:text-foreground transition-all touch-manipulation select-none shrink-0"
            aria-label="View battle log"
          >
            <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="truncate max-w-[140px] text-[11px]">
              {latestEvent || 'Log'}
            </span>
          </button>
        )}
      </div>

      {/* Main Controls Grid */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 w-full">
        {/* Moves: 2x2 grid on mobile, 4-across on desktop */}
        <div className="flex-1 min-w-0">
          <MovePanel
            moves={player.moves || []}
            isPending={isPending}
            disabled={isWaitingSwitch}
            onMoveSelect={onMoveSelect}
          />
        </div>

        {/* Action Buttons: Bag, Switch, Run */}
        <div className="lg:w-72 shrink-0 flex items-center">
          <ActionBar
            isPending={isPending}
            battleType={battleType}
            onOpenBag={onOpenBag}
            onOpenParty={onOpenParty}
            onRun={onRun}
          />
        </div>
      </div>
    </div>
  );
});
