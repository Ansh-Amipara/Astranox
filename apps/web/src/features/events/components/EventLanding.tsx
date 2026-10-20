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
    <div className="flex-1 p-3 sm:p-4 md:p-6 bg-background min-h-[calc(100dvh-64px)] flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl space-y-4 md:space-y-6">

        {/* Hero Banner Section */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden border border-border shadow-sm bg-surface">
          <img
            src="/banners/events-hero.webp"
            alt="Astranox Special Events & Operations Hub"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
          {/* Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/25">
                  Operations Hub
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-white/70">
                  Global Missions
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Special Operations
              </h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-lg line-clamp-1 sm:line-clamp-none">
                Participate in time-limited global missions, raids, and seasonal challenges to earn exclusive rewards.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl shadow-xs border border-border w-full space-y-6 text-center">
          {!isLoading && eventData?.event ? (
            <div className="bg-surface-raised border border-border rounded-2xl p-6 sm:p-8 text-center space-y-3">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-surface text-foreground border border-border">
                Active Mission
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">{eventData.event.name}</h2>
              <p className="text-xs sm:text-sm text-muted font-medium max-w-lg mx-auto">{eventData.event.description}</p>
              <div className="pt-3 max-w-xs mx-auto">
                <Link
                  to="/events/active"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 min-h-[44px] bg-primary text-primary-foreground rounded-xl font-black text-sm transition-all shadow-xs hover:opacity-90 active:scale-[0.98] touch-manipulation select-none"
                >
                  <FiTarget className="w-4 h-4" /> Go to Active Mission
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-surface-raised border border-border rounded-2xl p-8 text-center space-y-2">
              <h2 className="text-lg font-black text-foreground">No Active Operations</h2>
              <p className="text-xs sm:text-sm text-muted">Check back later for upcoming seasonal challenges and raid incursions.</p>
            </div>
          )}

          <div className="max-w-xs mx-auto">
            <Link
              to="/events/history"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 min-h-[44px] bg-surface-raised hover:bg-surface text-foreground border border-border rounded-xl font-bold text-sm transition-all active:scale-[0.98] touch-manipulation select-none"
            >
              <FiArchive className="w-4 h-4 text-muted" /> View Past Missions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
