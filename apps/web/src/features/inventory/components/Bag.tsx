import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useState } from 'react';
import { OwnedPokemonDto } from '@astranox/types';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { Skeleton, EmptyState, ErrorState, PokemonSprite } from '@/components/ui';
import { Dropdown } from '@/shared/ui/Dropdown';

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
      <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100vh-64px)] flex flex-col justify-start">
        <div className="w-full mx-auto space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-border pb-4">
            <Skeleton width={180} height={36} />
            <Skeleton width={200} height={40} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div key={idx} className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="rectangular" width={56} height={56} className="rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton width="80%" height={18} />
                    <Skeleton width="40%" height={14} />
                  </div>
                </div>
                <Skeleton width="100%" height={32} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 bg-background text-foreground p-6 min-h-[calc(100vh-64px)] flex items-center justify-center">
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

  return (
    <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            My Bag
          </h1>
        </div>

        {inventory.length > 0 && (
          <div className="w-full sm:w-56">
            <Dropdown
              value={selectedCategory}
              options={categories.map(cat => ({
                value: cat,
                label: cat === 'all' ? 'All Items' : cat.replace('-', ' ')
              }))}
              onChange={(val) => setSelectedCategory(val)}
              className="w-full"
            />
          </div>
        )}
      </div>

      {filteredInventory.length === 0 ? (
        <EmptyState
          title={inventory.length === 0 ? "Your Bag is Empty" : "No Items in this Category"}
          description={
            inventory.length === 0
              ? "You don't have any items in your bag yet. Win battles or visit the Pokémart to obtain items!"
              : "Try switching to another item category or view All Items."
          }
          action={
            inventory.length > 0 && selectedCategory !== 'all' ? (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-raised hover:bg-surface border border-border text-foreground transition-colors"
              >
                View All Items
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((inv) => (
            <div key={inv.itemId} className="bg-surface/80 backdrop-blur rounded-2xl p-6 border border-border/50 shadow-sm flex items-start gap-4">
              <div className="w-16 h-16 bg-surface-raised rounded-xl flex items-center justify-center p-2 border border-border shadow-inner shrink-0">
                {inv.item.spriteUrl ? (
                  <img src={inv.item.spriteUrl} alt={inv.item.name} className="w-12 h-12 object-contain filter drop-shadow-md" />
                ) : (
                  <div className="w-8 h-8 bg-surface-raised rounded-full"></div>
                )}
              </div>
              <div className="flex flex-col justify-between h-full w-full">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-foreground capitalize">{inv.item.name.replace('-', ' ')}</h3>
                    <span className="bg-surface-raised text-foreground px-3 py-1 rounded-full text-sm font-bold border border-border/30">
                      x {inv.quantity}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1 line-clamp-2">{inv.item.description}</p>
                </div>
                {inv.item.category === 'xp-candy' && (
                  <div className="mt-4 flex gap-2 w-full overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: 1 })}
                      disabled={useItemMutation.isPending}
                      className="flex-shrink-0 px-4 py-2 bg-surface-raised text-foreground hover:bg-surface-raised rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                      {useItemMutation.isPending ? 'Using...' : 'Use'}
                    </button>
                    
                    {inv.quantity > 1 && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        {[5, 10, 25, 50].map(qty => inv.quantity >= qty ? (
                          <button
                            key={qty}
                            onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: qty })}
                            disabled={useItemMutation.isPending}
                            className="px-2.5 py-2 text-xs font-bold bg-surface-raised text-subtle hover:bg-surface-raised rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {qty}x
                          </button>
                        ) : null)}
                        <button
                          onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: inv.quantity })}
                          disabled={useItemMutation.isPending}
                          className="px-2.5 py-2 text-xs font-bold bg-surface-raised text-subtle hover:bg-surface-raised rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          Max
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Use Item Modal for items requiring Pokemon target */}
      {selectedItemToUse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/50 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-border shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-2">Use {selectedItemToUse.item.name}</h2>
            <p className="text-subtle mb-6">Select a Pokémon to use this item on.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {save?.party?.map((p: OwnedPokemonDto) => (
                <button
                  key={p.id}
                  onClick={() => useItemMutation.mutate({ itemId: selectedItemToUse.itemId, targetPokemonId: p.id })}
                  disabled={useItemMutation.isPending}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface-raised hover:border-border transition-colors text-left disabled:opacity-50"
                >
                  <PokemonSprite speciesId={p.species.id} alt={p.species.name} size="lg" />
                  <div>
                    <div className="font-bold text-lg capitalize">{p.nickname || p.species.name}</div>
                    <div className="text-sm font-bold text-subtle">Level {p.level} &bull; {p.potential}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedItemToUse(null)}
                className="px-6 py-3 rounded-xl font-bold text-subtle hover:bg-surface-raised transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
