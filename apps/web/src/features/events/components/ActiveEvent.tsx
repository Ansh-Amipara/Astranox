import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { FiInfo, FiArrowLeft } from 'react-icons/fi';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { Link } from 'react-router-dom';

export function ActiveEvent() {
  const queryClient = useQueryClient();

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['activeEvent'],
    queryFn: async () => {
      const res = await api.get('/events/active');
      return res.data.data;
    }
  });

  const claimMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.post(`/events/${eventId}/claim`);
      return res.data;
    },
    onSuccess: () => {
      notify.success('Reward claimed successfully! Check your PC.');
      queryClient.invalidateQueries({ queryKey: ['activeEvent'] });
    },
    onError: (error: unknown) => {
      notify.error(parseApiError(error).message || 'Failed to claim reward');
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center p-8 bg-surface-raised min-h-[calc(100dvh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border"></div>
      </div>
    );
  }

  if (!eventData || !eventData.event) {
    return (
      <div className="flex-1 p-4 md:p-8 bg-background min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center">
        <div className="text-center bg-surface p-6 sm:p-8 shadow-xs border border-border max-w-md w-full rounded-2xl">
          <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2">No Active Events</h2>
          <p className="text-muted text-sm sm:text-base">There are currently no active challenge events.</p>
        </div>
      </div>
    );
  }

  const { event, progress, isClaimed } = eventData;
  const config = event.taskConfig || {};
  const requiredCount = config.requiredCount || 1;
  const currentProgress = Math.min(progress, requiredCount);
  const percent = Math.round((currentProgress / requiredCount) * 100);
  const isComplete = currentProgress >= requiredCount;

  // Time remaining calculation
  const endDate = new Date(event.endDate);
  const now = new Date();
  const diffTime = Math.max(0, endDate.getTime() - now.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  let timeRemaining = '';
  if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    timeRemaining = `${months} month${months !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  } else if (diffDays > 0) {
    timeRemaining = `${diffDays} days, ${diffHours} hours`;
  } else {
    timeRemaining = `${diffHours} hours`;
  }

  const rewardSpecies = event.rewardSpecies;

  return (
    <div className="flex-1 bg-background min-h-[calc(100dvh-64px)] w-full flex flex-col p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-left border-b border-border pb-5">
          <Link to="/events" className="inline-flex items-center gap-2 text-muted hover:text-foreground font-semibold text-sm mb-3 transition-colors min-h-[44px]">
            <FiArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">{event.name}</h1>
              <p className="text-sm text-muted font-medium mt-1">Ends in {timeRemaining}</p>
            </div>
            <span className="self-start sm:self-auto text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
              Active Challenge
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Task & Progress */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 text-left shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-foreground mb-4 flex items-center gap-2.5">
                  <FiInfo className="text-muted w-5 h-5" /> Task Objective
                </h2>
                <ul className="list-disc pl-5 text-muted space-y-2 font-medium text-sm sm:text-base">
                  <li>{event.description}</li>
                  {config.pokemonType && (
                    <li>Must be a <span className="font-bold text-foreground">{config.pokemonType} Type</span> Pokémon</li>
                  )}
                </ul>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                 <div className="flex justify-between text-sm font-bold text-foreground mb-2.5 px-0.5">
                   <span className="text-muted">Your Progress</span>
                   <span className="font-mono">{currentProgress} / {requiredCount} ({percent}%)</span>
                 </div>
                 <div className="w-full h-4 bg-surface-raised rounded-full overflow-hidden border border-border/50">
                   <div
                     className={`h-full transition-all duration-700 ease-out rounded-full ${isComplete ? 'bg-success' : 'bg-primary'}`}
                     style={{ width: `${percent}%` }}
                   />
                 </div>
                 <p className="text-xs text-subtle font-medium mt-4">
                   Note: Tasks must be completed before the event ends. Progress is saved, but unclaimed rewards expire.
                 </p>
              </div>
            </div>
          </div>

          {/* Right Column: Reward */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center justify-between text-center shadow-xs h-full">
              <div className="w-full">
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-surface-raised border border-border mb-4">
                  Event Reward
                </span>
                
                {rewardSpecies ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 my-2 drop-shadow-md hover:scale-105 transition-transform flex items-center justify-center">
                      <img
                        src={rewardSpecies.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${rewardSpecies.id}.png`}
                        alt={rewardSpecies.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-foreground capitalize mb-3">
                      {event.rewardConfig?.form ? `${event.rewardConfig.form} ${rewardSpecies.name}` : rewardSpecies.name}
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2 text-xs font-bold mb-4 w-full">
                      <span className="px-2.5 py-1 bg-surface-raised rounded-lg text-muted border border-border">Lv. {event.rewardConfig?.level || 5}</span>
                      <span className="px-2.5 py-1 bg-surface-raised rounded-lg text-muted border border-border">{event.rewardConfig?.potential || 'EX'}</span>
                      <span className="px-2.5 py-1 bg-surface-raised rounded-lg text-muted border border-border">{event.rewardConfig?.ivs || 'Max'} IVs</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      {rewardSpecies.type1 && <img src={getTypeSpriteUrl(rewardSpecies.type1.name, false)} alt={rewardSpecies.type1.name} title={rewardSpecies.type1.name} className="h-6 w-auto object-contain" loading="lazy" />}
                      {rewardSpecies.type2 && <img src={getTypeSpriteUrl(rewardSpecies.type2.name, false)} alt={rewardSpecies.type2.name} title={rewardSpecies.type2.name} className="h-6 w-auto object-contain" loading="lazy" />}
                    </div>
                  </div>
                ) : (
                   <div className="w-28 h-28 bg-surface-raised rounded-full flex items-center justify-center font-bold text-muted my-6 text-4xl border border-border">?</div>
                )}
              </div>
              
              <div className="w-full pt-4 border-t border-border mt-auto">
                {isClaimed ? (
                  <button disabled className="w-full bg-surface-raised text-muted font-bold py-3 min-h-[44px] rounded-xl cursor-not-allowed text-sm flex items-center justify-center border border-border">
                    Reward Claimed
                  </button>
                ) : isComplete ? (
                  <button
                    onClick={() => claimMutation.mutate(event.id)}
                    disabled={claimMutation.isPending}
                    className="w-full bg-primary hover:opacity-90 text-primary-foreground font-black py-3 min-h-[44px] rounded-xl shadow-xs transition-all active:scale-[0.98] text-sm flex items-center justify-center touch-manipulation select-none"
                  >
                    {claimMutation.isPending ? 'Claiming...' : 'Claim Reward!'}
                  </button>
                ) : (
                  <button disabled className="w-full bg-surface-raised/70 text-subtle font-bold py-3 min-h-[44px] rounded-xl border border-border cursor-not-allowed text-sm flex items-center justify-center">
                    Task Incomplete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
