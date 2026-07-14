import { memo } from 'react';

interface Props {
  lastTurnEvents: string[];
  status: string;
}

export const BattleLog = memo(function BattleLog({ lastTurnEvents, status }: Props) {
  return (
    <div className="w-1/5 bg-white dark:bg-slate-900 border-l border-slate-300 dark:border-slate-800 p-6 font-mono shadow-[-10px_0_40px_rgba(0,0,0,0.05)] dark:shadow-[-10px_0_40px_rgba(0,0,0,0.3)] transition-colors duration-200 flex flex-col z-20 h-full overflow-hidden">
      <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2 shrink-0">Battle Log</h3>
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
