import { memo } from 'react';

interface Props {
  lastTurnEvents: string[];
  status: string;
}

export const BattleLog = memo(function BattleLog({ lastTurnEvents, status }: Props) {
  return (
    <div className="w-1/5 bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-md border-l border-slate-300 dark:border-slate-700/50 p-6 font-mono shadow-xl transition-colors duration-200 flex flex-col z-20 h-full overflow-hidden">
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-300 mb-4 uppercase tracking-widest border-b border-slate-300 dark:border-slate-700/50 pb-2 shrink-0 drop-shadow-sm">Battle Log</h3>
      <div className="flex-1 flex flex-col overflow-y-auto min-h-0 no-scrollbar">
        <div className="flex flex-col space-y-2 pb-8">
          {lastTurnEvents.length > 0 ? (
            lastTurnEvents.map((msg: string, i: number) => (
              <p key={i} className="text-lg text-slate-800 dark:text-white mb-2 leading-relaxed capitalize">
                {msg}
              </p>
            ))
          ) : (
            <p className="text-lg text-slate-800 dark:text-white animate-pulse">
              {status === 'WAITING_SWITCH' || status === 'WAITING_MOVE_LEARN' ? 'Waiting for your action...' : 'What will you do?'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
