import { memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCompleteTowerBattle, useTowerState } from '@/features/tower/hooks/useTower';
import { useCompleteRiftEncounter, useAbandonRiftRun } from '@/features/rift/hooks/useRift';
import { Modal } from '@/shared/ui/Modal';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api/api';

import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';

interface Props {
  isFinished: boolean;
  status: string;
  battleType: string;
  lastTurnEvents: string[];
  wildSpeciesName: string;
  returnUrl: string;
  arenaTrainerId?: string | null;
}

export const BattleResultModal = memo(function BattleResultModal({
  isFinished,
  status,
  battleType,
  lastTurnEvents,
  wildSpeciesName,
  returnUrl,
  arenaTrainerId
}: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const completeTower = useCompleteTowerBattle();
  const completeRift = useCompleteRiftEncounter();
  const abandonRift = useAbandonRiftRun();
  const { data: towerData } = useTowerState({ enabled: battleType === 'TOWER' });

  const arenaEncounterMutation = useMutation({
    mutationFn: (trainerId: string) => api.post('/battles/arena-encounter', { trainerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankStatus'] });
      queryClient.invalidateQueries({ queryKey: ['authProfile'] });
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['battleSession'] });
      queryClient.removeQueries({ queryKey: ['activeBattle'] });
    },
    onError: (err: any) => {
      notify.error(parseApiError(err).message || 'Failed to start arena battle again');
    }
  });

  if (!isFinished) return null;

  const rewardEvents = lastTurnEvents.filter((msg: string) => 
    (msg.toLowerCase().includes('reward') || 
    msg.toLowerCase().includes('item') || 
    msg.toLowerCase().includes('passed') || 
    msg.toLowerCase().includes('promoted') ||
    msg.toLowerCase().includes('xp') ||
    msg.toLowerCase().includes('coins')) &&
    !msg.toLowerCase().includes('exp. points') &&
    !msg.toLowerCase().includes('click return')
  );

  const displayEvents = rewardEvents;

  const eventsNode: any = displayEvents.length > 0 ? (
    <div className="w-full bg-surface-raised/50 rounded-xl p-4 mb-6 border border-border flex flex-col items-center gap-1 max-h-48 overflow-y-auto custom-scrollbar">
      <span className="text-sm font-black text-muted uppercase tracking-widest mb-1">Got:</span>
      {(displayEvents as string[]).map((msg: string, i: number) => {
        const cleanMsg = msg.replace(/Battle Won! Reward:\s*/gi, '')
                            .replace(/Reward:\s*/gi, '')
                            .replace(/\+/g, '')
                            .trim();
        return (
          <p key={i} className="text-center font-bold text-muted">
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
          status === 'WON' || status === 'CAUGHT'
            ? 'text-success'
            : status === 'FLED'
            ? 'text-warning'
            : 'text-danger'
        }`}>
          {status === 'WON' ? 'VICTORY!' : status === 'CAUGHT' ? 'GOTCHA!' : status === 'FLED' ? 'FLED!' : 'DEFEATED!'}
        </h2>

        {/* Event List */}
        {eventsNode}

        {/* Tower Rewards */}
        {battleType === 'TOWER' && status === 'WON' && towerData?.activeEncounter?.reward && (
          <div className="w-full bg-surface rounded-xl p-6 mb-6 border border-border flex flex-row items-center justify-around shadow-inner">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center shadow-sm border border-border">
                <img src="/infinity.webp" alt="Infinity Coins" className="w-7 h-7 object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Coins</span>
                <span className="text-xl font-black text-foreground">
                  +{(towerData.activeEncounter.reward as any).infinityCoins || 0}
                </span>
              </div>
            </div>
            <div className="w-px h-16 bg-surface-raised"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center shadow-sm border border-border">
                <img src="/xp.webp" alt="Stored XP" className="w-7 h-7 object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Stored XP</span>
                <span className="text-xl font-black text-foreground">
                  +{(towerData.activeEncounter.reward as any).storedXp || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={`w-full py-4 px-6 rounded-xl mb-8 border font-bold text-center text-lg ${
          status === 'WON' || status === 'CAUGHT'
            ? 'bg-success/10 border-success/30 text-success'
            : status === 'FLED'
            ? 'bg-warning/10 border-warning/30 text-warning'
            : 'bg-danger/10 border-danger/30 text-danger'
        }`}>
          {status === 'WON' ? (battleType === 'TOWER' ? 'You cleared the floor!' : battleType === 'RIFT' ? 'You cleared the Rift floor!' : battleType === 'NPC' ? 'You defeated the opponent!' : `You defeated the wild ${wildSpeciesName}!`) : 
           status === 'CAUGHT' ? `You caught ${wildSpeciesName}!` :
           status === 'FLED' ? 'Got away safely!' : 'Better luck next time!'}
        </div>

        <div className="flex gap-4 w-full">
          {battleType === 'NPC' && arenaTrainerId && (
            <button
              disabled={arenaEncounterMutation.isPending || completeTower.isPending || completeRift.isPending || abandonRift.isPending}
              onClick={() => arenaEncounterMutation.mutate(arenaTrainerId)}
              className="w-full py-4 bg-gradient-to-r from-surface to-surface-raised hover:from-surface hover:to-surface-raised text-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {arenaEncounterMutation.isPending ? 'Starting...' : 'Fight Again'}
            </button>
          )}
          <button 
            disabled={completeTower.isPending || completeRift.isPending || abandonRift.isPending || arenaEncounterMutation.isPending}
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
                    notify.error(parseApiError(err).message || 'Failed to complete tower battle', { id: 'tower-complete-error' });
                    handleReturn(); // Fallback anyway
                  }
                });
              } else if (battleType === 'RIFT') {
                if (status === 'WON') {
                  completeRift.mutate(undefined, {
                    onSuccess: handleReturn,
                    onError: (err) => {
                      notify.error(parseApiError(err).message || 'Failed to complete rift battle', { id: 'rift-complete-error' });
                      handleReturn();
                    }
                  });
                } else {
                  abandonRift.mutate(undefined, {
                    onSuccess: handleReturn,
                    onError: (err) => {
                      notify.error(parseApiError(err).message || 'Failed to abandon rift battle', { id: 'rift-abandon-error' });
                      handleReturn();
                    }
                  });
                }
              } else {
                handleReturn();
              }
            }} 
            className="w-full py-4 bg-gradient-to-r from-surface to-surface-raised hover:from-surface hover:to-surface-raised text-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {completeTower.isPending || completeRift.isPending || abandonRift.isPending ? 'Processing...' : 'Return'}
          </button>
        </div>
      </div>
    </Modal>
  );
});
