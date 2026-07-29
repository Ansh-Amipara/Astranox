import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/api';
import { FiGift, FiTarget, FiClock, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';

export function EventDashboard() {
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to claim reward');
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!eventData || !eventData.event) {
    return (
      <div className="flex-1 p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-md w-full">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FiTarget className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Active Events</h2>
          <p className="text-slate-500 dark:text-slate-400">
            There are currently no active challenge events. Check back later!
          </p>
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

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-64px)] text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
            <FiTarget className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Active Event Challenge</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <FiClock /> Ends {new Date(event.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-purple-500/5 border border-purple-100 dark:border-purple-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{event.name}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">{event.description}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg font-black text-sm tracking-wider uppercase">
                {event.taskType.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-end mb-3">
                <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-sm">Challenge Progress</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {currentProgress} <span className="text-slate-400 text-lg">/ {requiredCount}</span>
                </div>
              </div>
              
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500' : 'bg-purple-500'}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                  <FiGift className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-black text-slate-900 dark:text-white text-lg">Event Reward</div>
                  <div className="text-slate-500 font-medium text-sm">Complete the challenge to claim</div>
                </div>
              </div>

              {isClaimed ? (
                <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-xl font-black">
                  <FiCheck className="w-5 h-5" /> Reward Claimed
                </div>
              ) : isComplete ? (
                <button
                  onClick={() => claimMutation.mutate(event.id)}
                  disabled={claimMutation.isPending}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black shadow-lg shadow-purple-500/25 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {claimMutation.isPending ? 'Claiming...' : 'Claim Reward!'}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full md:w-auto px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl font-black cursor-not-allowed"
                >
                  Incomplete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
