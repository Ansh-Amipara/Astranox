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
      <div className="flex-1 p-4 md:p-8 bg-surface-raised min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center">
        <div className="text-center bg-primary p-6 sm:p-8 shadow max-w-md w-full rounded">
          <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2">No Active Events</h2>
          <p className="text-subtle text-sm sm:text-base">There are currently no active challenge events.</p>
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
    <div className="flex-1 bg-surface min-h-[calc(100dvh-64px)] w-full flex flex-col p-4 sm:p-6 md:p-12">
      <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="text-left border-b border-border pb-4 sm:pb-6">
          <Link to="/events" className="inline-flex items-center gap-2 text-primary-foreground hover:text-subtle font-bold mb-3 sm:mb-4 transition-colors min-h-[44px]">
            <FiArrowLeft className="w-5 h-5" /> Back to Events
          </Link>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground mb-2">{event.name}</h1>
          <p className="text-sm sm:text-lg text-muted font-medium">Ends in {timeRemaining}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column: Task & Progress */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Task Box */}
            <div className="bg-surface-raised/50 border border-border rounded-2xl p-5 sm:p-8 text-left h-full">
              <h2 className="text-xl sm:text-2xl font-bold text-muted mb-4 flex items-center gap-3">
                <FiInfo className="text-foreground w-5 h-5 sm:w-6 sm:h-6" /> Task Objective
              </h2>
              <ul className="list-disc pl-5 sm:pl-6 text-muted space-y-2 font-medium text-base sm:text-lg">
                <li>{event.description}</li>
                {config.pokemonType && (
                  <li>Must be a <span className="font-bold">{config.pokemonType} Type</span> Pokemon</li>
                )}
              </ul>
              
              <div className="mt-8 sm:mt-12">
                 <div className="flex justify-between text-base sm:text-lg font-bold text-muted mb-3 px-1">
                   <span>Your Progress</span>
                   <span>{currentProgress} / {requiredCount}</span>
                 </div>
                 <div className="w-full h-5 sm:h-6 bg-surface-raised rounded-full overflow-hidden shadow-inner">
                   <div
                     className={`h-full transition-all duration-1000 ease-out ${isComplete ? 'bg-surface-raised' : 'bg-surface-raised'}`}
                     style={{ width: `${percent}%` }}
                   />
                 </div>
              </div>
              
              <p className="text-xs sm:text-sm text-muted font-medium mt-6">
                Note: Tasks must be completed before the event ends. Progress is saved, but rewards are forfeited if time runs out.
              </p>
            </div>
          </div>

          {/* Right Column: Reward */}
          <div className="lg:col-span-1">
            <div className="bg-surface-raised border border-border rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden h-full">
              <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-foreground mb-6 sm:mb-8 opacity-80">Event Reward</div>
              
              {rewardSpecies ? (
                <div className="flex flex-col items-center w-full">
                  <div className="w-32 h-32 sm:w-48 sm:h-48 mb-4 sm:mb-6 drop-shadow-xl hover:scale-110 transition-transform">
                    <img
                      src={rewardSpecies.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${rewardSpecies.id}.png`}
                      alt={rewardSpecies.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xl sm:text-3xl font-black text-foreground capitalize mb-4 sm:mb-6 text-center">
                    {event.rewardConfig?.form ? `${event.rewardConfig.form} ${rewardSpecies.name}` : rewardSpecies.name}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold mb-4 sm:mb-6 w-full">
                    <span className="px-3 py-1.5 sm:py-2 bg-surface rounded-lg shadow-sm text-muted border border-border">Lv. {event.rewardConfig?.level || 5}</span>
                    <span className="px-3 py-1.5 sm:py-2 bg-surface rounded-lg shadow-sm text-muted border border-border">{event.rewardConfig?.potential || 'DIAMOND'}</span>
                    <span className="px-3 py-1.5 sm:py-2 bg-surface rounded-lg shadow-sm text-muted border border-border">{event.rewardConfig?.ivs || 'Max'} IVs</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                    {rewardSpecies.type1 && <img src={getTypeSpriteUrl(rewardSpecies.type1.name, false)} alt={rewardSpecies.type1.name} title={rewardSpecies.type1.name} className="h-6 sm:h-8 w-auto object-contain drop-shadow-sm" loading="lazy" />}
                    {rewardSpecies.type2 && <img src={getTypeSpriteUrl(rewardSpecies.type2.name, false)} alt={rewardSpecies.type2.name} title={rewardSpecies.type2.name} className="h-6 sm:h-8 w-auto object-contain drop-shadow-sm" loading="lazy" />}
                  </div>
                </div>
              ) : (
                 <div className="w-32 h-32 sm:w-48 sm:h-48 bg-surface-raised rounded-full flex items-center justify-center font-bold text-muted mb-6 sm:mb-8 text-4xl sm:text-6xl">?</div>
              )}
              
              <div className="w-full mt-auto">
                {isClaimed ? (
                  <button disabled className="w-full bg-surface-raised text-muted font-bold py-4 sm:py-5 min-h-[44px] rounded-xl cursor-not-allowed text-base sm:text-lg flex items-center justify-center">
                    Reward Claimed
                  </button>
                ) : isComplete ? (
                  <button
                    onClick={() => claimMutation.mutate(event.id)}
                    disabled={claimMutation.isPending}
                    className="w-full bg-surface-raised hover:bg-surface-raised text-foreground font-black py-4 sm:py-5 min-h-[44px] rounded-xl shadow-lg hover:shadow-glow transition-all active:scale-95 text-lg sm:text-xl flex items-center justify-center"
                  >
                    {claimMutation.isPending ? 'Claiming...' : 'Claim Reward!'}
                  </button>
                ) : (
                  <button disabled className="w-full bg-surface-raised/50 text-muted font-bold py-4 sm:py-5 min-h-[44px] rounded-xl border border-border cursor-not-allowed text-base sm:text-lg flex items-center justify-center">
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
