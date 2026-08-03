import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { FiTarget, FiArchive } from 'react-icons/fi';

export function EventLanding() {
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['activeEvent'],
    queryFn: async () => {
      const res = await api.get('/events/active');
      return res.data.data;
    }
  });

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      <div className="text-center bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Events</h1>
          <p className="text-slate-500 dark:text-slate-400">Participate in challenges to earn exclusive rewards.</p>
        </div>

        {!isLoading && eventData?.event ? (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">There is an active event!</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">{eventData.event.name}</p>
            <Link to="/events/active" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-lg transition-colors">
              <FiTarget className="w-5 h-5" /> Go to Event
            </Link>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Active Events</h2>
            <p className="text-slate-500 dark:text-slate-400">Check back later for new challenges.</p>
          </div>
        )}

        <div>
          <Link to="/events/history" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-lg transition-colors">
            <FiArchive className="w-5 h-5" /> View Past Events
          </Link>
        </div>
      </div>
    </div>
  );
}
