import { useState } from 'react';
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
      <div className="flex-1 flex justify-center items-center p-8 bg-[#b8bcc8] min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
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
      const remainingDays = days % 30;
      return `${months} month${months !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''} ago`;
    }
    return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} ago`;
  };

  const filteredData = historyData || [];

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 min-h-[calc(100vh-64px)] w-full flex flex-col p-6 md:p-12">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="text-left border-b border-slate-200 dark:border-slate-800 pb-6">
          <Link to="/events" className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-300 font-bold mb-4 transition-colors">
            <FiArrowLeft className="w-5 h-5" /> Back to Events
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">Event History</h1>
        </div>

        {/* History List */}
        {!filteredData || filteredData.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <FiArchive className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-bold text-xl">No past events found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredData.map((item: any) => {
              const { event } = item;
              const config = event.taskConfig || {};
              const requiredCount = config.requiredCount || 1;
              const rewardSpecies = event.rewardSpecies;

              const displayName = rewardSpecies ?
                (event.rewardConfig?.form ? `${event.rewardConfig.form} ${rewardSpecies.name}` : rewardSpecies.name)
                : 'Unknown';

              return (
                <div key={event.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-0 flex flex-col md:flex-row relative overflow-hidden transition-all hover:shadow-lg">

                  {/* Left: Task Details */}
                  <div className="flex-1 p-8 text-left flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-3">
                      <FiArchive className="text-purple-500 w-6 h-6" /> {event.name || 'Task Objective'}
                    </h2>

                    <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2 font-medium text-lg mb-8">
                      <li>{event.description}</li>
                      {config.pokemonType && (
                        <li>Must be a <span className="font-bold">{config.pokemonType} Type</span> Pokemon</li>
                      )}
                    </ul>

                    <div className="mt-auto text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-900/50 inline-block px-4 py-3 rounded-lg self-start">
                      Ended {getTimeAgo(event.endDate)}
                    </div>
                  </div>

                  {/* Right: Pokemon Reward */}
                  <div className="md:w-[40%] bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-sm font-black uppercase tracking-widest text-purple-700 dark:text-purple-400 mb-6 opacity-80">Event Reward</div>

                    {rewardSpecies ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="w-32 h-32 mb-4 drop-shadow-xl hover:scale-110 transition-transform">
                          <img
                            src={rewardSpecies.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${rewardSpecies.id}.png`}
                            alt={rewardSpecies.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white capitalize mb-4 text-center">
                          {displayName}
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 text-xs font-bold mb-4 w-full">
                          <span className="px-2 py-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">Lv. {event.rewardConfig?.level || 5}</span>
                          <span className="px-2 py-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{event.rewardConfig?.potential || 'DIAMOND'}</span>
                          <span className="px-2 py-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{event.rewardConfig?.ivs || 'Max'} IVs</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          {rewardSpecies.type1 && <img src={getTypeSpriteUrl(rewardSpecies.type1.name, false)} alt={rewardSpecies.type1.name} title={rewardSpecies.type1.name} className="h-6 w-auto object-contain drop-shadow-sm" loading="lazy" />}
                          {rewardSpecies.type2 && <img src={getTypeSpriteUrl(rewardSpecies.type2.name, false)} alt={rewardSpecies.type2.name} title={rewardSpecies.type2.name} className="h-6 w-auto object-contain drop-shadow-sm" loading="lazy" />}
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 mb-6 text-4xl">?</div>
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
