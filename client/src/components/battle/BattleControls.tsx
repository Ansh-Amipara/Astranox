import { memo } from 'react';
import { ActionMenu } from './ActionMenu';

interface Props {
  player: any;
  status: string;
  battleType: string;
  rawEvents: any[];
  isPending: boolean;
  isFinished: boolean;
  isWaitingSwitch: boolean;
  onMoveSelect: (moveAction: string) => void;
  onSkipMove: () => void;
  onRun: () => void;
  onOpenBag: () => void;
  onOpenParty: () => void;
}

export const BattleControls = memo(function BattleControls({
  player,
  status,
  battleType,
  rawEvents,
  isPending,
  isFinished,
  isWaitingSwitch,
  onMoveSelect,
  onSkipMove,
  onRun,
  onOpenBag,
  onOpenParty
}: Props) {
  return (
    <div className="bg-slate-100 dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 transition-colors duration-200 shrink-0">
      <div className="w-full h-24">
        <div className="h-full bg-slate-200 dark:bg-slate-900 rounded-xl p-4 flex flex-col transition-colors duration-200">
          {(!isFinished || isWaitingSwitch || status === 'WAITING_MOVE_LEARN') && (
            <ActionMenu
              player={player}
              status={status}
              battleType={battleType}
              rawEvents={rawEvents}
              isPending={isPending}
              onMoveSelect={onMoveSelect}
              onSkipMove={onSkipMove}
              onRun={onRun}
              onOpenBag={onOpenBag}
              onOpenParty={onOpenParty}
            />
          )}
        </div>
      </div>
    </div>
  );
});
