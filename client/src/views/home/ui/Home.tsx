import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../shared/store/auth.store';
import { apiClient, getSpriteUrl } from '../../../shared/api/api-client';
import { StarterSelection } from '../../starter-selection/ui/StarterSelection';
import { FiBox, FiMap, FiShoppingCart, FiTarget, FiBookOpen, FiLayers, FiAperture, FiInfo, FiShoppingBag } from 'react-icons/fi';

export function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: save, isLoading: isSaveLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await apiClient.get('/trainers/me');
      return data.data;
    },
  });

  if (isSaveLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Trainer Data...</div>;
  }

  if (!save?.starterChosenAt) {
    return <StarterSelection />;
  }

  const party = save?.party || [];
  const teamCp = party.reduce((sum: number, p: any) => sum + (p.cp || 0), 0);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6 max-w-none">

        {/* Header Section */}
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center p-1">
                <img src="/astral.png" alt="Astral Coins" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Astral Coins</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 truncate">{save.astralCoins?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center p-1">
                <img src="/infinity.png" alt="Infinity Coins" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Infinity Coins</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 truncate">{save.infinityCoins?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center p-1.5">
                <img src="/xp.png" alt="Stored XP" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Stored XP</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 truncate">{save.storedXp?.toLocaleString() || 0} XP</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform overflow-hidden">
              <div className="truncate">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Trainer Rank</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 capitalize truncate">{save.rank.replace('_MINUS_RANK', '-').replace('_PLUS_RANK', '+').replace('_RANK', '')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform overflow-hidden">
              <div className="truncate">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Player CP</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-200 truncate">{teamCp.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Party (Full Width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Active Party
            </h2>
            <div className="flex gap-4">
              <button onClick={() => navigate('/pokemon')} className="text-purple-600 dark:text-purple-400 font-bold hover:underline text-sm flex items-center gap-1">
                PC Box &rarr;
              </button>
              <button onClick={() => navigate('/team')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm flex items-center gap-1">
                Manage Team &rarr;
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10 hide-scrollbar">
            {Array.from({ length: 6 }).map((_, i) => {
              const pkm = party.find((p: any) => p.position === i);
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl p-4 border flex flex-col items-center text-center transition-all ${pkm
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                    : 'border-dashed border-slate-300 dark:border-slate-700 bg-transparent opacity-50'
                    }`}
                >
                  {pkm ? (
                    <>
                      <img
                        src={getSpriteUrl(pkm.speciesId)}
                        alt={pkm.species?.name}
                        className="w-16 h-16 object-contain pixelated mb-2 drop-shadow-md hover:scale-110 transition-transform"
                      />
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 capitalize truncate w-full">
                        {pkm.nickname || pkm.species?.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                          Lv {pkm.level}
                        </span>
                        {pkm.potential && (
                          <span className="text-[10px] uppercase font-bold text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50 px-1 rounded">
                            {pkm.potential.split('_')[0]}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded w-full border border-indigo-100 dark:border-indigo-800/50 truncate">
                        CP {pkm.cp?.toLocaleString() || 0}
                      </div>
                    </>
                  ) : (
                    <div className="w-16 h-16 border-2 border-slate-300 dark:border-slate-600 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-black mb-2">
                      ?
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center relative z-10">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Team CP</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">{teamCp.toLocaleString()}</span>
          </div>
        </div>

        {/* Bottom Layout (Actions + Inventory) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Actions (Left 2 Columns) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            <button onClick={() => navigate('/explore')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between group transition-all hover:-translate-y-1 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Explore</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FiMap className="text-2xl text-blue-500 dark:text-blue-400" />
              </div>
            </button>

            <button onClick={() => navigate('/arena')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between group transition-all hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Battle Arena</h3>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FiTarget className="text-2xl text-indigo-500 dark:text-indigo-400" />
              </div>
            </button>

            <button onClick={() => navigate('/tower')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between group transition-all hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Infinity Tower</h3>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FiLayers className="text-2xl text-indigo-500 dark:text-indigo-400" />
              </div>
            </button>

            <button onClick={() => navigate('/rift')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between group transition-all hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Dimensional Rift</h3>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FiAperture className="text-2xl text-purple-500 dark:text-purple-400" />
              </div>
            </button>

            <button onClick={() => navigate('/shop')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between group transition-all hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Poké Mart</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FiShoppingCart className="text-2xl text-blue-500 dark:text-blue-400" />
              </div>
            </button>

            <button onClick={() => navigate('/pokedex')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between group transition-all hover:-translate-y-1 hover:border-yellow-300 dark:hover:border-yellow-700 hover:shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Pokédex</h3>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FiBookOpen className="text-2xl text-indigo-500 dark:text-indigo-400" />
              </div>
            </button>

            <button onClick={() => navigate('/info')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between group transition-all hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Game Info</h3>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FiInfo className="text-2xl text-slate-500 dark:text-slate-300" />
              </div>
            </button>

            <button onClick={() => navigate('/marketplace')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left flex items-start justify-between group transition-all hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Marketplace</h3>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FiShoppingBag className="text-2xl text-purple-500 dark:text-purple-400" />
              </div>
            </button>
          </div>

          {/* Inventory Stats (Right Column) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-full">
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FiBox className="text-purple-500" /> Inventory Stats
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">Total Items</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {save.inventory?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">Unique Items</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {save.inventory?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={() => navigate('/inventory')} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm flex justify-center items-center gap-2">
                  <FiBox /> Open Inventory
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
