import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { FiInfo } from 'react-icons/fi';
import { toast } from 'sonner';

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
      toast.success('Reward claimed successfully! Check your PC.');
      queryClient.invalidateQueries({ queryKey: ['activeEvent'] });
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to claim reward');
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center p-8 bg-slate-200 dark:bg-slate-900 min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!eventData || !eventData.event) {
    return (
      <div className="flex-1 p-4 md:p-8 bg-slate-200 dark:bg-slate-900 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <div className="text-center bg-white p-8 shadow max-w-md w-full rounded">
          <h2 className="text-2xl font-black text-slate-800 mb-2">No Active Events</h2>
          <p className="text-slate-500">There are currently no active challenge events.</p>
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
    <div className="flex-1 bg-white dark:bg-slate-900 min-h-[calc(100vh-64px)] w-full flex flex-col p-6 md:p-12">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-left border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{event.name}</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Ends in {timeRemaining}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Task & Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Task Box */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-left h-full">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-3">
                <FiInfo className="text-purple-500 w-6 h-6" /> Task Objective
              </h2>
              <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2 font-medium text-lg">
                <li>{event.description}</li>
                {config.pokemonType && (
                  <li>Must be a <span className="font-bold">{config.pokemonType} Type</span> Pokemon</li>
                )}
              </ul>
              
              <div className="mt-12">
                 <div className="flex justify-between text-lg font-bold text-slate-700 dark:text-slate-300 mb-3 px-1">
                   <span>Your Progress</span>
                   <span>{currentProgress} / {requiredCount}</span>
                 </div>
                 <div className="w-full h-6 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                   <div
                     className={`h-full transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-purple-500'}`}
                     style={{ width: `${percent}%` }}
                   />
                 </div>
              </div>
              
              <p className="text-sm text-slate-400 font-medium mt-6">
                Note: Tasks must be completed before the event ends. Progress is saved, but rewards are forfeited if time runs out.
              </p>
            </div>
          </div>

          {/* Right Column: Reward */}
          <div className="lg:col-span-1">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden h-full">
              <div className="text-sm font-black uppercase tracking-widest text-purple-700 dark:text-purple-400 mb-8 opacity-80">Event Reward</div>
              
              {rewardSpecies ? (
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 mb-6 drop-shadow-xl hover:scale-110 transition-transform">
                    <img
                      src={rewardSpecies.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${rewardSpecies.id}.png`}
                      alt={rewardSpecies.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white capitalize mb-6 text-center">
                    {event.rewardConfig?.form ? `${event.rewardConfig.form} ${rewardSpecies.name}` : rewardSpecies.name}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3 text-sm font-bold mb-6 w-full">
                    <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">Lv. {event.rewardConfig?.level || 5}</span>
                    <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{event.rewardConfig?.potential || 'DIAMOND'}</span>
                    <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{event.rewardConfig?.ivs || 'Max'} IVs</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-8">
                    {rewardSpecies.type1 && <img src={getTypeSpriteUrl(rewardSpecies.type1.name, false)} alt={rewardSpecies.type1.name} title={rewardSpecies.type1.name} className="h-8 w-auto object-contain drop-shadow-sm" loading="lazy" />}
                    {rewardSpecies.type2 && <img src={getTypeSpriteUrl(rewardSpecies.type2.name, false)} alt={rewardSpecies.type2.name} title={rewardSpecies.type2.name} className="h-8 w-auto object-contain drop-shadow-sm" loading="lazy" />}
                  </div>
                </div>
              ) : (
                 <div className="w-48 h-48 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 mb-8 text-6xl">?</div>
              )}
              
              <div className="w-full mt-auto">
                {isClaimed ? (
                  <button disabled className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-5 rounded-xl cursor-not-allowed text-lg">
                    Reward Claimed
                  </button>
                ) : isComplete ? (
                  <button
                    onClick={() => claimMutation.mutate(event.id)}
                    disabled={claimMutation.isPending}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 text-xl"
                  >
                    {claimMutation.isPending ? 'Claiming...' : 'Claim Reward!'}
                  </button>
                ) : (
                  <button disabled className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-bold py-5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-not-allowed text-lg">
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
