import { memo } from 'react';

interface Props {
  lastTurnEvents: string[];
  status: string;
}

export const BattleLog = memo(function BattleLog({ lastTurnEvents, status }: Props) {
  return (
    <div className="w-full h-32 lg:w-1/5 lg:h-full bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-slate-300 dark:border-slate-700/50 p-3 lg:p-6 font-mono shadow-xl transition-colors duration-200 flex flex-col z-20 shrink-0 overflow-hidden">
      <h3 className="hidden lg:block text-xl font-black text-slate-800 dark:text-slate-300 mb-4 uppercase tracking-widest border-b border-slate-300 dark:border-slate-700/50 pb-2 shrink-0 drop-shadow-sm">Battle Log</h3>
      <div className="flex-1 flex flex-col overflow-y-auto min-h-0 no-scrollbar">
        <div className="flex flex-col space-y-1 lg:space-y-2 pb-2 lg:pb-8">
          {lastTurnEvents.length > 0 ? (
            lastTurnEvents.map((msg: string, i: number) => (
              <p key={i} className="text-sm lg:text-lg text-slate-800 dark:text-white mb-1 lg:mb-2 leading-relaxed capitalize">
                {msg}
              </p>
            ))
          ) : (
            <p className="text-sm lg:text-lg text-slate-800 dark:text-white animate-pulse">
              {status === 'WAITING_SWITCH' || status === 'WAITING_MOVE_LEARN' ? 'Waiting for your action...' : 'What will you do?'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
