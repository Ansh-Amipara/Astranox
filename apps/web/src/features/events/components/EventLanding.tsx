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
      <div className="text-center bg-surface p-5 sm:p-8 rounded-3xl shadow-xl border border-border max-w-lg w-full space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">Events</h1>
          <p className="text-sm sm:text-base text-muted">Participate in challenges to earn exclusive rewards.</p>
        </div>

        {!isLoading && eventData?.event ? (
          <div className="bg-surface-raised border border-border rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">There is an active event!</h2>
            <p className="text-muted mb-6 font-medium">{eventData.event.name}</p>
            <Link to="/events/active" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-surface-raised hover:bg-surface-raised text-foreground rounded-xl font-black text-lg transition-colors">
              <FiTarget className="w-5 h-5" /> Go to Event
            </Link>
          </div>
        ) : (
          <div className="bg-surface-raised/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-muted mb-2">No Active Events</h2>
            <p className="text-muted">Check back later for new challenges.</p>
          </div>
        )}

        <div>
          <Link to="/events/history" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-surface-raised hover:bg-surface-raised text-muted rounded-xl font-black text-lg transition-colors">
            <FiArchive className="w-5 h-5" /> View Past Events
          </Link>
        </div>
      </div>
    </div>
  );
}
