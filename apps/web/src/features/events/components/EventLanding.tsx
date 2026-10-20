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
    <div className="flex-1 p-4 md:p-8 bg-background min-h-[calc(100dvh-64px)] flex flex-col items-center pt-6 sm:pt-8 md:pt-12">
      <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-xs border border-border max-w-lg w-full space-y-6 text-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Events &amp; Challenges</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">Participate in time-limited global missions to earn exclusive rewards</p>
        </div>

        {!isLoading && eventData?.event ? (
          <div className="bg-surface-raised border border-border rounded-xl p-5 sm:p-6 text-center space-y-3">
            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
              Active Challenge
            </span>
            <h2 className="text-lg sm:text-xl font-black text-foreground">{eventData.event.name}</h2>
            <p className="text-xs text-muted font-medium">{eventData.event.description}</p>
            <div className="pt-2">
              <Link
                to="/events/active"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 min-h-[44px] bg-primary text-primary-foreground rounded-xl font-black text-sm transition-all shadow-xs hover:opacity-90 active:scale-[0.98] touch-manipulation select-none"
              >
                <FiTarget className="w-4 h-4" /> Go to Active Event
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-raised border border-border rounded-xl p-6 text-center space-y-2">
            <h2 className="text-base font-black text-foreground">No Active Events</h2>
            <p className="text-xs text-muted">Check back later for upcoming seasonal challenges.</p>
          </div>
        )}

        <div>
          <Link
            to="/events/history"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 min-h-[44px] bg-surface-raised hover:bg-surface-raised/80 text-foreground border border-border rounded-xl font-bold text-sm transition-all active:scale-[0.98] touch-manipulation select-none"
          >
            <FiArchive className="w-4 h-4 text-muted" /> View Past Events
          </Link>
        </div>
      </div>
    </div>
  );
}
