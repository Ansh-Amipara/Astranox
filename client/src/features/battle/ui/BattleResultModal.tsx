'use client';
import { memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Props {
  isFinished: boolean;
  status: string;
  battleType: string;
  lastTurnEvents: string[];
  wildSpeciesName: string;
}

export const BattleResultModal = memo(function BattleResultModal({
  isFinished,
  status,
  battleType,
  lastTurnEvents,
  wildSpeciesName,
}: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  if (!isFinished) return null;
  
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full max-w-md flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-300">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-wide uppercase text-center">
          Battle Finished!
        </h2>

        {/* Event List */}
        {lastTurnEvents.length > 0 && (
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {lastTurnEvents.map((msg: string, i: number) => (
              <p key={i} className="text-center font-medium text-slate-700 dark:text-slate-300 capitalize">
                {msg}
              </p>
            ))}
          </div>
        )}

        <div className={`w-full py-4 px-6 rounded-xl mb-8 border font-bold text-center text-lg ${
          status === 'WON' || status === 'CAUGHT' 
            ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : status === 'FLED' 
            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
            : 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {status === 'WON' ? (battleType === 'NPC' ? 'You defeated the opposing Trainer!' : `You defeated the wild ${wildSpeciesName}!`) : 
           status === 'CAUGHT' ? `Gotcha! ${wildSpeciesName} was caught!` :
           status === 'FLED' ? 'Got away safely!' : 'Defeated! Better luck next time!'}
        </div>

        <button 
          onClick={() => {
            queryClient.setQueryData(['activeBattle'], null);
            router.push(returnUrl);
          }} 
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Return
        </button>
      </div>
    </div>
  );
});
