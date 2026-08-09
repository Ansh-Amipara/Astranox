import { memo } from 'react';
import { ActionMenu } from './ActionMenu';
import { ActivePokemonDto, TurnEventDto } from '@astranox/types';;

interface Props {
  player: ActivePokemonDto;
  status: string;
  rawEvents: TurnEventDto[];
  isPending: boolean;
  isFinished: boolean;
  isWaitingSwitch: boolean;
  battleType?: string;
  onMoveSelect: (moveAction: string) => void;
  onSkipMove: () => void;
  onRun: () => void;
  onOpenBag: () => void;
  onOpenParty: () => void;
}

export const BattleControls = memo(function BattleControls({
  player,
  status,
  rawEvents,
  isPending,
  isFinished,
  isWaitingSwitch,
  battleType,
  onMoveSelect,
  onSkipMove,
  onRun,
  onOpenBag,
  onOpenParty
}: Props) {
  return (
    <div className="bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-300 dark:border-slate-700/50 p-2 sm:p-4 shadow-2xl z-20 transition-colors duration-200 shrink-0">
      <div className="w-full h-auto sm:h-24 min-h-[4rem] sm:min-h-[6rem]">
        <div className="h-full bg-slate-100/50 dark:bg-slate-900/50 rounded-xl p-2 sm:p-4 flex flex-col transition-colors duration-200 shadow-inner">
          {(!isFinished || isWaitingSwitch || status === 'WAITING_MOVE_LEARN') && (
            <ActionMenu
              player={player}
              status={status}
              rawEvents={rawEvents}
              isPending={isPending}
              battleType={battleType}
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
