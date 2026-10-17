import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { apiClient } from '@/lib/api-client';
import { getSpriteUrl } from '@/shared/api/api';
import { StarterSelection } from '@/features/pokemon/components/StarterSelection';
import { FiBox, FiMap, FiShoppingCart, FiTarget, FiBookOpen, FiLayers, FiAperture, FiInfo, FiShoppingBag } from 'react-icons/fi';

export function Home() {
  const { user: _user } = useAuthStore();
  const navigate = useNavigate();

  const { data: save, isLoading: isSaveLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await apiClient.get('/trainers/me');
      return data.data;
    },
  });

  if (isSaveLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">Loading Trainer Data...</div>;
  }

  if (!save?.starterChosenAt) {
    return <StarterSelection />;
  }

  const party = save?.party || [];
  const teamCp = party.reduce((sum: number, p: any) => sum + (p.cp || 0), 0);

  return (
    <div className="flex-1 bg-black text-white p-4 md:p-6 min-h-[calc(100vh-64px)] flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6 max-w-none">

        {/* Header Section */}
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xl flex items-center gap-2 sm:gap-3 hover:-translate-y-0.5 hover:border-neutral-700 transition-all overflow-hidden">
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center p-1">
                <img src="/astral.webp" alt="Astral Coins" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider truncate">Astral Coins</p>
                <p className="text-base sm:text-lg font-black text-white truncate">{save.astralCoins?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xl flex items-center gap-2 sm:gap-3 hover:-translate-y-0.5 hover:border-neutral-700 transition-all overflow-hidden">
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center p-1">
                <img src="/infinity.webp" alt="Infinity Coins" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider truncate">Infinity Coins</p>
                <p className="text-base sm:text-lg font-black text-white truncate">{save.infinityCoins?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xl flex items-center gap-2 sm:gap-3 hover:-translate-y-0.5 hover:border-neutral-700 transition-all overflow-hidden">
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center p-1.5">
                <img src="/xp.webp" alt="Stored XP" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider truncate">Stored XP</p>
                <p className="text-base sm:text-lg font-black text-white truncate">{save.storedXp?.toLocaleString() || 0} XP</p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xl flex items-center gap-2 sm:gap-3 hover:-translate-y-0.5 hover:border-neutral-700 transition-all overflow-hidden">
              <div className="truncate">
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider truncate">Trainer Rank</p>
                <p className="text-base sm:text-lg font-black text-white uppercase truncate">{save.rank?.replace('_MINUS', '-').replace('_PLUS', '+').replace('_', '') || 'F'}</p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xl flex items-center gap-2 sm:gap-3 hover:-translate-y-0.5 hover:border-neutral-700 transition-all overflow-hidden col-span-2 md:col-span-1">
              <div className="truncate">
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider truncate">Player CP</p>
                <p className="text-base sm:text-lg font-black text-white truncate">{teamCp.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Party (Full Width) */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 relative z-10">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Active Party
            </h2>
            <div className="flex gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <button onClick={() => navigate('/pokemon')} className="text-neutral-400 font-bold hover:text-white hover:underline text-sm flex items-center gap-1 transition-colors">
                PC Box &rarr;
              </button>
              <button onClick={() => navigate('/team')} className="text-white font-bold hover:underline text-sm flex items-center gap-1 transition-colors">
                Manage Team &rarr;
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10 hide-scrollbar">
            {Array.from({ length: 6 }).map((_, i) => {
              const pkm = party.find((p: any) => p.position === i);
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl p-4 border flex flex-col items-center text-center transition-all ${pkm
                    ? 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-600 hover:shadow-lg'
                    : 'border-dashed border-neutral-800 bg-transparent opacity-40'
                    }`}
                >
                  {pkm ? (
                    <>
                      <img
                        src={getSpriteUrl(pkm.speciesId, pkm.species?.spriteUrl)}
                        alt={pkm.species?.name}
                        className="w-16 h-16 object-contain pixelated mb-2 drop-shadow-md hover:scale-110 transition-transform"
                      />
                      <h3 className="font-bold text-sm text-white capitalize truncate w-full">
                        {pkm.nickname || pkm.species?.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-neutral-300 bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded">
                          Lv {pkm.level}
                        </span>
                        {pkm.potential && (
                          <span className="text-[10px] uppercase font-black text-white bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 rounded">
                            {pkm.potential.split('_')[0]}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs font-black text-white bg-neutral-900 px-2 py-1 rounded w-full border border-neutral-800 truncate">
                        CP {pkm.cp?.toLocaleString() || 0}
                      </div>
                    </>
                  ) : (
                    <div className="w-16 h-16 border-2 border-neutral-800 rounded-full flex items-center justify-center text-neutral-600 font-black mb-2">
                      ?
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Layout (Actions + Inventory) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Actions (Left 2 Columns) */}
          <div className="lg:col-span-2 grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <button onClick={() => navigate('/explore')} className="bg-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-0 group transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl text-center sm:text-left">
              <div className="w-full">
                <h3 className="text-sm sm:text-xl font-bold text-white truncate">Explore</h3>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                <FiMap className="text-xl sm:text-2xl text-white" />
              </div>
            </button>

            <button onClick={() => navigate('/arena')} className="bg-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-0 group transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl text-center sm:text-left">
              <div className="w-full">
                <h3 className="text-sm sm:text-xl font-bold text-white truncate">Battle Arena</h3>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                <FiTarget className="text-xl sm:text-2xl text-white" />
              </div>
            </button>

            <button onClick={() => navigate('/tower')} className="bg-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-0 group transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl text-center sm:text-left">
              <div className="w-full">
                <h3 className="text-sm sm:text-xl font-bold text-white truncate">Infinity Tower</h3>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                <FiLayers className="text-xl sm:text-2xl text-white" />
              </div>
            </button>

            <button onClick={() => navigate('/rift')} className="bg-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-0 group transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl text-center sm:text-left">
              <div className="w-full">
                <h3 className="text-sm sm:text-xl font-bold text-white truncate">Void Rifts</h3>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                <FiAperture className="text-xl sm:text-2xl text-white" />
              </div>
            </button>

            <button onClick={() => navigate('/shop')} className="bg-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-0 group transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl text-center sm:text-left">
              <div className="w-full">
                <h3 className="text-sm sm:text-xl font-bold text-white truncate">Poké Mart</h3>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                <FiShoppingCart className="text-xl sm:text-2xl text-white" />
              </div>
            </button>

            <button onClick={() => navigate('/pokedex')} className="bg-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-0 group transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl text-center sm:text-left">
              <div className="w-full">
                <h3 className="text-sm sm:text-xl font-bold text-white truncate">Pokédex</h3>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                <FiBookOpen className="text-xl sm:text-2xl text-white" />
              </div>
            </button>

            <button onClick={() => navigate('/info')} className="bg-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-0 group transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl text-center sm:text-left">
              <div className="w-full">
                <h3 className="text-sm sm:text-xl font-bold text-white truncate">Game Info</h3>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                <FiInfo className="text-xl sm:text-2xl text-white" />
              </div>
            </button>

            <button onClick={() => navigate('/marketplace')} className="bg-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-0 group transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-2xl text-center sm:text-left">
              <div className="w-full">
                <h3 className="text-sm sm:text-xl font-bold text-white truncate">Marketplace</h3>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
                <FiShoppingBag className="text-xl sm:text-2xl text-white" />
              </div>
            </button>
          </div>

          {/* Inventory Stats (Right Column) */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between h-full">
              <div>
                <h2 className="text-xl font-black text-white mb-3 flex items-center gap-2">
                  <FiBox className="text-white" /> Inventory Stats
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl">
                    <span className="font-bold text-neutral-400 text-sm">Total Items</span>
                    <span className="font-black text-white">
                      {save.inventory?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-900/80 border border-neutral-800/80 rounded-xl">
                    <span className="font-bold text-neutral-400 text-sm">Unique Items</span>
                    <span className="font-black text-white">
                      {save.inventory?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={() => navigate('/inventory')} className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold rounded-xl transition-colors text-sm flex justify-center items-center gap-2">
                  <FiBox /> Open Inventory
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
