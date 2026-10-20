import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useState } from 'react';
import { OwnedPokemonDto } from '@astranox/types';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { Skeleton, EmptyState, ErrorState, PokemonSprite, Button } from '@/components/ui';
import { Package } from 'lucide-react';
import { cn } from '@/lib/cn';

interface InventoryItem {
  itemId: string;
  quantity: number;
  item: {
    name: string;
    description: string;
    spriteUrl: string | null;
    category: string;
  };
}

export function Bag() {
  const queryClient = useQueryClient();
  const [selectedItemToUse, setSelectedItemToUse] = useState<InventoryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: save, isLoading, isError, refetch } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    }
  });

  const useItemMutation = useMutation({
    mutationFn: async (data: { itemId: string; targetPokemonId?: string; quantity?: number }) => {
      const res = await api.post('/inventory/use', data);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      notify.success(res.data.message);
      setSelectedItemToUse(null);
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to use item');
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100dvh-4rem)] flex flex-col justify-start">
        <div className="w-full mx-auto space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 border-b border-border pb-4">
            <div className="space-y-2">
              <Skeleton width={180} height={36} className="rounded-xl" />
              <Skeleton width={120} height={20} className="rounded-lg" />
            </div>
            <Skeleton width={260} height={40} className="rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div key={idx} className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <Skeleton variant="rectangular" width={56} height={56} className="rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton width="75%" height={18} className="rounded" />
                    <Skeleton width="45%" height={14} className="rounded" />
                  </div>
                </div>
                <Skeleton width="100%" height={36} className="rounded-xl mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 bg-background text-foreground p-6 min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <ErrorState
          title="Failed to Load Bag"
          message="Could not load your trainer inventory from the server. Please check your connection."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const inventory: InventoryItem[] = (save?.inventory || []).filter(
    (inv: InventoryItem) => inv.quantity > 0
  );

  const categories = ['all', ...Array.from(new Set(inventory.map(inv => inv.item.category === 'infinity-only' ? 'potential' : inv.item.category)))].sort();
  const filteredInventory = selectedCategory === 'all' 
    ? inventory 
    : inventory.filter(inv => {
        const cat = inv.item.category === 'infinity-only' ? 'potential' : inv.item.category;
        return cat === selectedCategory;
      });

  const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity, 0);

  return (
    <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100dvh-4rem)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-5 md:space-y-6">
        
        {/* Header & Category Filter Bar */}
        <div className="flex flex-col gap-4 border-b border-border pb-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  My Bag
                </h1>
                {inventory.length > 0 && (
                  <span className="bg-surface-raised border border-border px-2.5 py-0.5 rounded-full text-xs font-bold text-muted shadow-xs">
                    {inventory.length} {inventory.length === 1 ? 'item' : 'items'} ({totalQuantity.toLocaleString()} total)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                Manage and use your items, candies, and consumables.
              </p>
            </div>
          </div>

          {/* Category Pill Filters (Pokémon HOME style) */}
          {inventory.length > 0 && categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = cat === 'all' 
                  ? inventory.length 
                  : inventory.filter(inv => (inv.item.category === 'infinity-only' ? 'potential' : inv.item.category) === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'min-h-[44px] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 select-none touch-manipulation',
                      isSelected
                        ? 'bg-primary text-primary-foreground font-black shadow-xs'
                        : 'bg-surface text-muted hover:text-foreground hover:bg-surface-raised border border-border shadow-xs'
                    )}
                  >
                    <span>{cat === 'all' ? 'All Items' : cat.replace(/-/g, ' ')}</span>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-black',
                      isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-surface-raised text-muted'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredInventory.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title={inventory.length === 0 ? "Your Bag is Empty" : "No Items in this Category"}
            description={
              inventory.length === 0
                ? "You don't have any items in your bag yet. Win battles, explore regions, or visit the Pokémart to obtain items!"
                : "Try switching to another item category or view All Items."
            }
            action={
              inventory.length > 0 && selectedCategory !== 'all' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="mt-2"
                >
                  View All Items
                </Button>
              ) : undefined
            }
          />
        ) : (
          /* Item Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredInventory.map((inv) => (
              <div 
                key={inv.itemId} 
                className="group bg-surface rounded-2xl border border-border p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-surface-raised rounded-xl flex items-center justify-center p-2 border border-border shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
                      {inv.item.spriteUrl ? (
                        <img 
                          src={inv.item.spriteUrl} 
                          alt={inv.item.name} 
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-sm" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-border rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="text-base font-bold text-foreground capitalize truncate tracking-tight group-hover:text-primary transition-colors">
                          {inv.item.name.replace(/-/g, ' ')}
                        </h3>
                        <span className="shrink-0 bg-surface-raised border border-border text-foreground px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs">
                          x{inv.quantity.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                        {inv.item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions: XP Candy instant-use or Pokémon target modal */}
                {inv.item.category === 'xp-candy' ? (
                  <div className="mt-3.5 pt-3 border-t border-border flex flex-wrap items-center gap-1.5">
                    <button 
                      onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: 1 })}
                      disabled={useItemMutation.isPending}
                      className="min-h-[44px] px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 touch-manipulation"
                    >
                      {useItemMutation.isPending ? 'Using...' : 'Use 1x'}
                    </button>
                    
                    {inv.quantity > 1 && (
                      <div className="flex items-center gap-1 ml-auto">
                        {[5, 10, 25, 50].map(qty => inv.quantity >= qty ? (
                          <button
                            key={qty}
                            onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: qty })}
                            disabled={useItemMutation.isPending}
                            className="min-h-[44px] px-2.5 py-2 text-xs font-bold bg-surface-raised text-muted hover:text-foreground hover:bg-surface border border-border rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap touch-manipulation active:scale-[0.98]"
                          >
                            {qty}x
                          </button>
                        ) : null)}
                        <button
                          onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: inv.quantity })}
                          disabled={useItemMutation.isPending}
                          className="min-h-[44px] px-2.5 py-2 text-xs font-black bg-surface-raised text-foreground hover:bg-surface border border-border rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap touch-manipulation active:scale-[0.98]"
                        >
                          Max
                        </button>
                      </div>
                    )}
                  </div>
                ) : ['potential', 'evolution-stones', 'medicine', 'vitamins'].includes(inv.item.category) ? (
                  <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-end">
                    <button
                      onClick={() => setSelectedItemToUse(inv)}
                      className="min-h-[44px] px-4 py-2 bg-surface-raised hover:bg-surface border border-border text-foreground text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] touch-manipulation"
                    >
                      Use on Pokémon
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Use Item Modal for items requiring Pokemon target (Responsive Bottom Sheet on Mobile) */}
        {selectedItemToUse && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-border shadow-2xl relative max-h-[85dvh] pb-safe overflow-y-auto animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
              <div className="sm:hidden mx-auto -mt-1 mb-3 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground capitalize tracking-tight">
                    Use {selectedItemToUse.item.name.replace(/-/g, ' ')}
                  </h2>
                  <p className="text-muted text-xs sm:text-sm mt-0.5">
                    Select a Pokémon in your party to apply this item to.
                  </p>
                </div>
                <div className="shrink-0 w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center p-1.5 shadow-xs">
                  {selectedItemToUse.item.spriteUrl && (
                    <img src={selectedItemToUse.item.spriteUrl} alt={selectedItemToUse.item.name} className="w-8 h-8 object-contain" />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {save?.party?.map((p: OwnedPokemonDto) => (
                  <button
                    key={p.id}
                    onClick={() => useItemMutation.mutate({ itemId: selectedItemToUse.itemId, targetPokemonId: p.id })}
                    disabled={useItemMutation.isPending}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-surface hover:bg-surface-raised hover:-translate-y-0.5 active:scale-[0.98] shadow-xs transition-all text-left disabled:opacity-50 touch-manipulation"
                  >
                    <PokemonSprite speciesId={p.species.id} alt={p.species.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base capitalize truncate text-foreground">
                        {p.nickname || p.species.name}
                      </div>
                      <div className="text-xs font-semibold text-muted flex items-center gap-1.5 mt-0.5">
                        <span className="bg-surface-raised border border-border px-1.5 py-0.2 rounded text-[10px] font-black text-foreground">
                          Lv. {p.level}
                        </span>
                        <span>•</span>
                        <span>{p.potential}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  variant="secondary"
                  size="md"
                  onClick={() => setSelectedItemToUse(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
