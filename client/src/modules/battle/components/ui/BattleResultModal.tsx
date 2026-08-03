import { memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCompleteTowerBattle, useTowerState } from '@/modules/tower/components/useTower';
import { useCompleteRiftEncounter, useAbandonRiftRun } from '@/modules/rift/components/useRift';
import { Modal } from '@/shared/ui/Modal';

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
  const completeTower = useCompleteTowerBattle();
  const completeRift = useCompleteRiftEncounter();
  const abandonRift = useAbandonRiftRun();
  const { data: towerData } = useTowerState({ enabled: battleType === 'TOWER' });

  if (!isFinished) return null;

  const rewardEvents = lastTurnEvents.filter((msg: string) => 
    (msg.toLowerCase().includes('reward') || 
    msg.toLowerCase().includes('item') || 
    msg.toLowerCase().includes('passed') || 
    msg.toLowerCase().includes('promoted') ||
    msg.toLowerCase().includes('xp') ||
    msg.toLowerCase().includes('coins')) &&
    !msg.toLowerCase().includes('exp. points')
  );

  const displayEvents = rewardEvents;

  const eventsNode: any = displayEvents.length > 0 ? (
    <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1 max-h-48 overflow-y-auto custom-scrollbar">
      <span className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Got:</span>
      {(displayEvents as string[]).map((msg: string, i: number) => {
        const cleanMsg = msg.replace(/Battle Won! Reward:\s*/gi, '')
                            .replace(/Reward:\s*/gi, '')
                            .replace(/\+/g, '')
                            .trim();
        return (
          <p key={i} className="text-center font-bold text-slate-700 dark:text-slate-300">
            {cleanMsg}
          </p>
        );
      })}
    </div>
  ) : null;

  return (
    <Modal isOpen={true} onClose={() => {}} className="max-w-xl" hideHeader>
      <div className="p-8 flex flex-col items-center">
        <h2 className={`text-3xl font-black mb-6 tracking-wide uppercase text-center ${
          status === 'WON' || status === 'CAUGHT' ? 'text-green-600 dark:text-green-400' :
          status === 'FLED' ? 'text-blue-600 dark:text-blue-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {status === 'WON' ? 'VICTORY!' : status === 'CAUGHT' ? 'GOTCHA!' : status === 'FLED' ? 'FLED!' : 'DEFEATED!'}
        </h2>

        {/* Event List */}
        {eventsNode}

        {/* Tower Rewards */}
        {battleType === 'TOWER' && status === 'WON' && towerData?.activeEncounter?.reward && (
          <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700 flex flex-row items-center justify-around shadow-inner">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shadow-sm border border-yellow-200/50 dark:border-yellow-800/50">
                <img src="/infinity.png" alt="Infinity Coins" className="w-7 h-7 object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coins</span>
                <span className="text-xl font-black text-yellow-600 dark:text-yellow-400">
                  +{(towerData.activeEncounter.reward as any).infinityCoins || 0}
                </span>
              </div>
            </div>
            <div className="w-px h-16 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shadow-sm border border-blue-200/50 dark:border-blue-800/50">
                <img src="/xp.png" alt="Stored XP" className="w-7 h-7 object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stored XP</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  +{(towerData.activeEncounter.reward as any).storedXp || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={`w-full py-4 px-6 rounded-xl mb-8 border font-bold text-center text-lg ${
          status === 'WON' || status === 'CAUGHT' 
            ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : status === 'FLED' 
            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
            : 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {status === 'WON' ? (battleType === 'TOWER' ? 'You cleared the floor!' : battleType === 'RIFT' ? 'You cleared the Rift floor!' : battleType === 'NPC' ? 'You defeated the opponent!' : `You defeated the wild ${wildSpeciesName}!`) : 
           status === 'CAUGHT' ? `You caught ${wildSpeciesName}!` :
           status === 'FLED' ? 'Got away safely!' : 'Better luck next time!'}
        </div>

        <div className="flex gap-4 w-full">
          <button 
            disabled={completeTower.isPending || completeRift.isPending || abandonRift.isPending}
            onClick={() => {
              const handleReturn = () => {
                queryClient.invalidateQueries({ queryKey: ['rankStatus'] });
                queryClient.invalidateQueries({ queryKey: ['authProfile'] });
                queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
                navigate(returnUrl);
                setTimeout(() => {
                  queryClient.removeQueries({ queryKey: ['activeBattle'] });
                  queryClient.removeQueries({ queryKey: ['battleSession'] });
                }, 100);
              };

              if (battleType === 'TOWER') {
                completeTower.mutate(status === 'WON' ? 'WON' : 'LOST', {
                  onSuccess: handleReturn,
                  onError: (err) => {
                    console.error(err);
                    handleReturn(); // Fallback anyway
                  }
                });
              } else if (battleType === 'RIFT') {
                if (status === 'WON') {
                  completeRift.mutate(undefined, {
                    onSuccess: handleReturn,
                    onError: (err) => {
                      console.error(err);
                      handleReturn();
                    }
                  });
                } else {
                  abandonRift.mutate(undefined, {
                    onSuccess: handleReturn,
                    onError: (err) => {
                      console.error(err);
                      handleReturn();
                    }
                  });
                }
              } else {
                handleReturn();
              }
            }} 
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {completeTower.isPending || completeRift.isPending || abandonRift.isPending ? 'Processing...' : 'Return'}
          </button>
        </div>
      </div>
    </Modal>
  );
});
