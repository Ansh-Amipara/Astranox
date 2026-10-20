import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { FiArchive, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export function EventHistory() {

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['eventHistory'],
    queryFn: async () => {
      const res = await api.get('/events/history');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center p-8 bg-background min-h-[calc(100dvh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border"></div>
      </div>
    );
  }

  const getTimeAgo = (dateStr: string) => {
    const ended = new Date(dateStr);
    const diff = new Date().getTime() - ended.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = diff % 30;
      return `${months} month${months !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''} ago`;
    }
    return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} ago`;
  };

  const filteredData = historyData || [];

  return (
    <div className="flex-1 bg-background min-h-[calc(100dvh-64px)] w-full flex flex-col p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-left border-b border-border pb-5">
          <Link to="/events" className="inline-flex items-center gap-2 text-muted hover:text-foreground font-semibold text-sm mb-3 transition-colors min-h-[44px]">
            <FiArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">Event History</h1>
          <p className="text-sm text-muted font-medium mt-1">Review past challenges and their exclusive rewards</p>
        </div>

        {/* History List */}
        {!filteredData || filteredData.length === 0 ? (
          <div className="text-center p-8 sm:p-12 bg-surface rounded-2xl border border-border shadow-xs">
            <FiArchive className="w-10 h-10 text-muted mx-auto mb-3" />
            <h2 className="text-lg font-black text-foreground">No Past Events</h2>
            <p className="text-sm text-muted mt-1">No completed events found in the archives.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredData.map((item: any) => {
              const { event } = item;
              const config = event.taskConfig || {};
              const rewardSpecies = event.rewardSpecies;

              const displayName = rewardSpecies ?
                (event.rewardConfig?.form ? `${event.rewardConfig.form} ${rewardSpecies.name}` : rewardSpecies.name)
                : 'Unknown';

              return (
                <div key={event.id} className="bg-surface border border-border rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row overflow-hidden">

                  {/* Left: Task Details */}
                  <div className="flex-1 p-5 sm:p-6 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-raised text-muted border border-border">
                          Concluded
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-foreground mb-3 flex items-center gap-2">
                        <FiArchive className="text-muted w-4 h-4 shrink-0" /> {event.name || 'Challenge Event'}
                      </h2>

                      <ul className="list-disc pl-5 text-muted space-y-1.5 font-medium text-xs sm:text-sm mb-4">
                        <li>{event.description}</li>
                        {config.pokemonType && (
                          <li>Must be a <span className="font-bold text-foreground">{config.pokemonType} Type</span> Pokémon</li>
                        )}
                      </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border text-xs font-semibold text-subtle">
                      Ended {getTimeAgo(event.endDate)}
                    </div>
                  </div>

                  {/* Right: Pokemon Reward */}
                  <div className="md:w-44 bg-surface-raised border-t md:border-t-0 md:border-l border-border p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted mb-2">Reward</span>

                    {rewardSpecies ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="w-20 h-20 mb-2 drop-shadow-sm flex items-center justify-center">
                          <img
                            src={rewardSpecies.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${rewardSpecies.id}.png`}
                            alt={rewardSpecies.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-sm font-black text-foreground capitalize mb-2 line-clamp-1">
                          {displayName}
                        </div>

                        <div className="flex flex-wrap justify-center gap-1 text-[10px] font-bold mb-2 w-full">
                          <span className="px-1.5 py-0.5 bg-surface rounded text-muted border border-border">Lv. {event.rewardConfig?.level || 5}</span>
                          <span className="px-1.5 py-0.5 bg-surface rounded text-muted border border-border">{event.rewardConfig?.potential || 'DIAMOND'}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                          {rewardSpecies.type1 && <img src={getTypeSpriteUrl(rewardSpecies.type1.name, false)} alt={rewardSpecies.type1.name} title={rewardSpecies.type1.name} className="h-5 w-auto object-contain" loading="lazy" />}
                          {rewardSpecies.type2 && <img src={getTypeSpriteUrl(rewardSpecies.type2.name, false)} alt={rewardSpecies.type2.name} title={rewardSpecies.type2.name} className="h-5 w-auto object-contain" loading="lazy" />}
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center font-bold text-muted my-2 text-2xl border border-border">?</div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
