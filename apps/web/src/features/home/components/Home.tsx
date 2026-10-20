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
    return <div className="min-h-[100dvh] bg-background flex items-center justify-center text-foreground font-bold">Loading Trainer Data...</div>;
  }

  if (!save?.starterChosenAt) {
    return <StarterSelection />;
  }

  const party = save?.party || [];
  const teamCp = party.reduce((sum: number, p: any) => sum + (p.cp || 0), 0);

  return (
    <div className="flex-1 bg-background text-foreground p-4 sm:p-6 md:p-8 min-h-[calc(100dvh-64px)] flex flex-col justify-start">
      <div className="w-full mx-auto space-y-6 max-w-7xl">

        {/* Currency & Stat Pills */}
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-surface-raised border border-border flex items-center justify-center p-1.5">
                <img src="/astral.webp" alt="Astral Coins" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">Astral Coins</p>
                <p className="text-base font-black text-foreground font-mono truncate">{save.astralCoins?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-surface-raised border border-border flex items-center justify-center p-1.5">
                <img src="/infinity.webp" alt="Infinity Coins" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">Infinity Coins</p>
                <p className="text-base font-black text-foreground font-mono truncate">{save.infinityCoins?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-surface-raised border border-border flex items-center justify-center p-1.5">
                <img src="/xp.webp" alt="Stored XP" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">Stored XP</p>
                <p className="text-base font-black text-foreground font-mono truncate">{save.storedXp?.toLocaleString() || 0} XP</p>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-xs font-black text-muted">
                ★
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">Trainer Rank</p>
                <p className="text-base font-black text-foreground uppercase truncate">{save.rank?.replace('_MINUS', '-').replace('_PLUS', '+').replace('_', '') || 'F'}</p>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-xs flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden col-span-2 md:col-span-1">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-xs font-black text-muted">
                CP
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">Team CP</p>
                <p className="text-base font-black text-foreground font-mono truncate">{teamCp.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Party Section */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted px-2 py-0.5 rounded-full bg-surface-raised border border-border inline-block mb-1">
                Battle Formation
              </span>
              <h2 className="text-lg sm:text-xl font-black text-foreground">
                Active Party
              </h2>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => navigate('/pokemon')}
                className="px-3 py-1.5 min-h-[36px] bg-surface-raised hover:bg-surface-raised/80 border border-border rounded-lg text-xs font-bold text-muted hover:text-foreground transition-all active:scale-[0.98] touch-manipulation select-none"
              >
                Pokémon Box
              </button>
              <button
                onClick={() => navigate('/team')}
                className="px-3.5 py-1.5 min-h-[36px] bg-primary hover:opacity-90 text-primary-foreground rounded-lg text-xs font-black transition-all shadow-xs active:scale-[0.98] touch-manipulation select-none"
              >
                Manage Team &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const pkm = party.find((p: any) => p.position === i);
              return (
                <div
                  key={i}
                  className={`relative rounded-xl p-3 border flex flex-col items-center text-center transition-all ${
                    pkm
                      ? 'border-border bg-surface-raised/60 hover:bg-surface-raised hover:shadow-xs hover:-translate-y-0.5'
                      : 'border-dashed border-border/80 bg-surface-raised/20'
                  }`}
                >
                  {pkm ? (
                    <>
                      <div className="w-16 h-16 my-1 flex items-center justify-center">
                        <img
                          src={getSpriteUrl(pkm.speciesId, pkm.species?.spriteUrl)}
                          alt={pkm.species?.name}
                          className="w-full h-full object-contain pixelated drop-shadow-sm hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="font-bold text-xs text-foreground capitalize truncate w-full mt-1">
                        {pkm.nickname || pkm.species?.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
                          Lv. {pkm.level}
                        </span>
                        {pkm.potential && (
                          <span className="text-[9px] uppercase font-black text-foreground bg-surface border border-border px-1.5 py-0.5 rounded">
                            {pkm.potential.split('_')[0]}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-[10px] font-black text-muted font-mono bg-surface px-2 py-0.5 rounded-md w-full border border-border truncate">
                        CP {pkm.cp?.toLocaleString() || 0}
                      </div>
                    </>
                  ) : (
                    <div className="h-28 flex flex-col items-center justify-center text-subtle font-black text-xs">
                      <span className="w-8 h-8 rounded-full border border-dashed border-border flex items-center justify-center text-subtle mb-1">
                        +
                      </span>
                      Slot {i + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Navigation + Inventory Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Action Tiles */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: 'Explore', path: '/explore', icon: FiMap },
              { title: 'Battle Arena', path: '/arena', icon: FiTarget },
              { title: 'Infinity Tower', path: '/tower', icon: FiLayers },
              { title: 'Void Rifts', path: '/rift', icon: FiAperture },
              { title: 'Poké Mart', path: '/shop', icon: FiShoppingCart },
              { title: 'Pokédex', path: '/pokedex', icon: FiBookOpen },
              { title: 'Marketplace', path: '/marketplace', icon: FiShoppingBag },
              { title: 'Game Info', path: '/info', icon: FiInfo },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex flex-col items-start justify-between min-h-[96px] group transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] text-left touch-manipulation select-none"
                >
                  <div className="w-8 h-8 rounded-xl bg-surface-raised border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <h3 className="text-sm font-black text-foreground truncate w-full mt-3">{action.title}</h3>
                </button>
              );
            })}
          </div>

          {/* Inventory Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted px-2 py-0.5 rounded-full bg-surface-raised border border-border inline-block mb-1">
                  Storage
                </span>
                <h2 className="text-base font-black text-foreground flex items-center gap-2">
                  <FiBox className="text-muted w-4 h-4" /> Trainer Bag
                </h2>
                
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className="p-3 bg-surface-raised border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Total Items</span>
                    <span className="text-lg font-black text-foreground font-mono mt-0.5 block">
                      {save.inventory?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-raised border border-border rounded-xl">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Unique Types</span>
                    <span className="text-lg font-black text-foreground font-mono mt-0.5 block">
                      {save.inventory?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => navigate('/inventory')}
                  className="w-full py-2.5 px-4 bg-surface-raised hover:bg-surface-raised/80 border border-border text-foreground font-bold rounded-xl transition-all active:scale-[0.98] text-xs flex justify-center items-center gap-2 min-h-[44px] touch-manipulation select-none"
                >
                  <FiBox className="w-4 h-4 text-muted" /> Open Bag
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
