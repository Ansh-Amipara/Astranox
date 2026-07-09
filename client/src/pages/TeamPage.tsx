import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function TeamPage() {
  const { data: save, isLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Team Data...</div>;
  }

  const party = save?.party || [];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Team</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">View the details and stats of your active Pokémon party.</p>
          </div>
          <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
            {party.length} / 6 Pokémon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => {
            const pkm = party.find((p: any) => p.position === i);

            return (
              <div 
                key={i} 
                className={`relative rounded-2xl overflow-hidden border transition-colors ${pkm ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 shadow-lg' : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30 shadow-sm dark:shadow-none'}`}
              >
                {pkm ? (
                  <div className="p-6 flex items-start gap-6">
                    <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <img 
                        src={`http://localhost:3000/sprites/${pkm.speciesId}.png`} 
                        alt={pkm.species?.name}
                        className="w-20 h-20 object-contain drop-shadow-md"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize truncate">
                          {pkm.nickname || pkm.species?.name}
                        </h3>
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
                          Lv. {pkm.level}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-sm">
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">HP</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivHp}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">ATK</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivAttack}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">DEF</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivDefense}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">SPA</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivSpAtk}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">SPD</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivSpDef}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                          <span className="text-xs font-bold tracking-wider">SPE</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pkm.ivSpeed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 h-[140px] flex items-center justify-center">
                    <span className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-sm">Empty Slot</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
