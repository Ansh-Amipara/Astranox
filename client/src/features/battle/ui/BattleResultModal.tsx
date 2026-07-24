import { memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface Props {
  isFinished: boolean;
  status: string;
  battleType: string;
  lastTurnEvents: string[];
  wildSpeciesName: string;
  returnUrl: string;
}

export const BattleResultModal = memo(function BattleResultModal({
  isFinished,
  status,
  battleType,
  lastTurnEvents,
  wildSpeciesName,
  returnUrl,
}: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (!isFinished) return null;

  const rewardEvents = lastTurnEvents.filter((msg: string) => 
    msg.toLowerCase().includes('reward') || 
    msg.toLowerCase().includes('item') || 
    msg.toLowerCase().includes('passed') || 
    msg.toLowerCase().includes('promoted') ||
    msg.toLowerCase().includes('xp')
  );

  const displayEvents = rewardEvents.length > 0 ? rewardEvents : lastTurnEvents;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 w-full max-w-xl flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-300">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-wide uppercase text-center">
          Battle Finished!
        </h2>

        {/* Event List */}
        {displayEvents.length > 0 && (
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {displayEvents.map((msg: string, i: number) => (
              <p key={i} className="text-center font-semibold text-slate-700 dark:text-slate-300">
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
          {status === 'WON' ? (battleType === 'NPC' ? 'Victory! You defeated the Rank Examiner!' : `You defeated the wild ${wildSpeciesName}!`) : 
           status === 'CAUGHT' ? `Gotcha! ${wildSpeciesName} was caught!` :
           status === 'FLED' ? 'Got away safely!' : 'Defeated! Better luck next time!'}
        </div>

        <div className="flex gap-4 w-full">
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['rankStatus'] });
              queryClient.invalidateQueries({ queryKey: ['authProfile'] });
              queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
              navigate(returnUrl);
              setTimeout(() => {
                queryClient.removeQueries({ queryKey: ['activeBattle'] });
              }, 100);
            }} 
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
});
